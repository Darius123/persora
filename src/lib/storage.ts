import type { Verdict } from "./agents";

const INDEXER_RPC = "https://indexer-storage-testnet-turbo.0g.ai";
const RPC_URL = "https://evmrpc-testnet.0g.ai";

export interface StoredVerdict {
  verdict: Verdict;
  rootHash: string;
  storedAt: string;
}

export async function storeVerdict(verdict: Verdict): Promise<string> {
  const privateKey = process.env.ZG_PRIVATE_KEY;

  if (!privateKey) {
    // Return a deterministic mock hash in dev when no key is set
    const mockHash = Buffer.from(JSON.stringify(verdict).slice(0, 32)).toString("hex").padEnd(64, "0");
    return `0x${mockHash}`;
  }

  const { Indexer, ZgFile } = await import("@0gfoundation/0g-storage-ts-sdk");
  const { ethers } = await import("ethers");

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const signer = new ethers.Wallet(privateKey, provider);
  const indexer = new Indexer(INDEXER_RPC);

  const data = JSON.stringify(verdict, null, 2);
  const buffer = Buffer.from(data, "utf-8");

  const tmpPath = `/tmp/persora-verdict-${Date.now()}.json`;
  const fs = await import("fs/promises");
  await fs.writeFile(tmpPath, buffer);

  try {
    const file = await ZgFile.fromFilePath(tmpPath);
    const [tree] = await file.merkleTree();
    const [, err] = await indexer.upload(file, RPC_URL, signer);
    await file.close();

    if (err) throw new Error(`0G Storage upload failed: ${err}`);
    const rootHash = tree?.rootHash();
    if (!rootHash) throw new Error("Failed to get root hash from merkle tree");
    return rootHash;
  } finally {
    await fs.unlink(tmpPath).catch(() => {});
  }
}

export function buildShareUrl(rootHash: string): string {
  const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  return `${base}/verdict/${encodeURIComponent(rootHash)}`;
}

export function buildStorageScanUrl(rootHash: string): string {
  return `https://storagescan-galileo.0g.ai/file?cid=${encodeURIComponent(rootHash)}`;
}

export async function retrieveVerdict(rootHash: string): Promise<Verdict | null> {
  try {
    const { Indexer } = await import("@0gfoundation/0g-storage-ts-sdk");
    const indexer = new Indexer(INDEXER_RPC);
    const [blob, err] = await indexer.downloadToBlob(rootHash);
    if (err || !blob) return null;
    const text = await blob.text();
    return JSON.parse(text) as Verdict;
  } catch {
    return null;
  }
}
