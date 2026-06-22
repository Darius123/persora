import { ethers } from "ethers";

const RPC = "https://evmrpc-testnet.0g.ai";
export const PREDICTION_COST_USD = 0.02; // always $0.02 per prediction

// Cache 0G price for 5 minutes to avoid hammering CoinGecko
let _cachedPrice: number | null = null;
let _cacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000;

export async function get0GPrice(): Promise<number> {
  if (_cachedPrice && Date.now() - _cacheTime < CACHE_TTL) return _cachedPrice;
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=zero-gravity&vs_currencies=usd",
      { next: { revalidate: 300 } }
    );
    const data = await res.json();
    const price = data["zero-gravity"]?.usd;
    if (price) {
      _cachedPrice = price;
      _cacheTime = Date.now();
      return price;
    }
  } catch {}
  // fallback to last known price or conservative estimate
  return _cachedPrice ?? 0.27;
}

export async function getRequiredA0GI(): Promise<number> {
  const price = await get0GPrice();
  // round up to 4 decimal places
  return Math.ceil((PREDICTION_COST_USD / price) * 10000) / 10000;
}

// In-memory used-hash store — prevents replaying a tx within a server session
const usedHashes = new Set<string>();

export async function verifyPayment(
  walletAddress: string,
  txHash: string
): Promise<{ ok: boolean; error?: string }> {
  const hash = txHash.toLowerCase();
  const treasury = process.env.NEXT_PUBLIC_TREASURY_ADDRESS?.toLowerCase();

  if (!treasury) return { ok: false, error: "Treasury not configured" };
  if (usedHashes.has(hash)) return { ok: false, error: "Transaction already used" };

  const provider = new ethers.JsonRpcProvider(RPC);

  let tx: ethers.TransactionResponse | null = null;
  let receipt: ethers.TransactionReceipt | null = null;

  // Retry up to 5 times — tx may not be indexed immediately
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      [tx, receipt] = await Promise.all([
        provider.getTransaction(txHash),
        provider.getTransactionReceipt(txHash),
      ]);
      if (tx && receipt) break;
    } catch {
      if (attempt === 4) return { ok: false, error: "Could not reach 0G network" };
    }
    await new Promise(r => setTimeout(r, 2000));
  }

  if (!tx || !receipt) return { ok: false, error: "Transaction not found on 0G — try again in a few seconds" };
  if (receipt.status !== 1) return { ok: false, error: "Transaction failed on-chain" };
  if (tx.to?.toLowerCase() !== treasury) return { ok: false, error: "Wrong recipient address" };
  if (tx.from.toLowerCase() !== walletAddress.toLowerCase()) {
    return { ok: false, error: "Transaction not from your wallet" };
  }

  // Verify value covers $0.01 at current 0G price
  const required = await getRequiredA0GI();
  const valueOg = parseFloat(ethers.formatEther(tx.value));
  if (valueOg < required) {
    return { ok: false, error: `Minimum payment is ${required} A0GI (~$${PREDICTION_COST_USD})` };
  }

  usedHashes.add(hash);
  return { ok: true };
}
