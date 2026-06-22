import { get0GPrice } from "./payment";

const RPC = "https://evmrpc-testnet.0g.ai";
const INFERENCE_COST_USD = 0.002;
const TOPUP_AMOUNT_OG = 3;
const TOPUP_THRESHOLD_OG = 0.3;

let _estimatedBalance: number | null = null;
let _topping = false;

async function withRetry<T>(fn: () => Promise<T>, attempts = 3, delayMs = 3000): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (i < attempts - 1) await new Promise(r => setTimeout(r, delayMs * (i + 1)));
    }
  }
  throw lastErr;
}

async function getBroker() {
  const { ethers } = await import("ethers");
  const { createZGComputeNetworkBroker } = await import("@0gfoundation/0g-compute-ts-sdk");
  const key = process.env.OPERATOR_PRIVATE_KEY;
  if (!key) throw new Error("OPERATOR_PRIVATE_KEY not set");
  const provider = new ethers.JsonRpcProvider(RPC);
  const wallet = new ethers.Wallet(key, provider);
  return createZGComputeNetworkBroker(wallet);
}

async function ensureLedger(broker: Awaited<ReturnType<typeof getBroker>>, amountOg: number) {
  try {
    await withRetry(() => broker.ledger.getLedger());
    console.log("[topup] Ledger exists");
  } catch {
    console.log(`[topup] Creating ledger with ${amountOg} A0GI`);
    await withRetry(() => broker.ledger.addLedger(amountOg));
    console.log("[topup] Ledger created");
  }
}

export async function deductAndTopUpIfNeeded(): Promise<void> {
  if (_topping) return;

  const price = await get0GPrice();
  const costOg = INFERENCE_COST_USD / price;

  if (_estimatedBalance === null) {
    try {
      _topping = true;
      const broker = await withRetry(getBroker);
      await ensureLedger(broker, TOPUP_AMOUNT_OG);
      _estimatedBalance = TOPUP_AMOUNT_OG - costOg;
    } catch (err) {
      console.error("[topup] Init failed after retries:", err);
      _estimatedBalance = 0;
    } finally {
      _topping = false;
    }
    return;
  }

  _estimatedBalance = Math.max(0, _estimatedBalance - costOg);

  if (_estimatedBalance < TOPUP_THRESHOLD_OG) {
    try {
      _topping = true;
      const broker = await withRetry(getBroker);
      await ensureLedger(broker, TOPUP_AMOUNT_OG);
      await withRetry(() => broker.ledger.depositFund(TOPUP_AMOUNT_OG));
      _estimatedBalance += TOPUP_AMOUNT_OG;
      console.log(`[topup] Topped up ${TOPUP_AMOUNT_OG} A0GI. Balance: ~${_estimatedBalance.toFixed(4)}`);
    } catch (err) {
      console.error("[topup] Top-up failed after retries:", err);
    } finally {
      _topping = false;
    }
  }
}

export function getEstimatedBalance(): number | null {
  return _estimatedBalance;
}
