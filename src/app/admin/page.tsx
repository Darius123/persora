"use client";

import { useState, useEffect } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { ethers } from "ethers";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

const ADMIN_ADDRESS = "0xc46Cc1d2BAf3955D325219fcE9DEcC52FEf55476".toLowerCase();
const TREASURY = process.env.NEXT_PUBLIC_TREASURY_ADDRESS!;
const RPC = "https://evmrpc-testnet.0g.ai";

export default function AdminPage() {
  const { authenticated, login } = usePrivy();
  const { wallets } = useWallets();
  const walletAddress = wallets[0]?.address ?? null;
  const isAdmin = walletAddress?.toLowerCase() === ADMIN_ADDRESS;

  const [treasuryBalance, setTreasuryBalance] = useState<string | null>(null);
  const [inferenceBalance, setInferenceBalance] = useState<number | null>(null);
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAdmin) return;
    const provider = new ethers.JsonRpcProvider(RPC);
    provider.getBalance(TREASURY).then((b) =>
      setTreasuryBalance(parseFloat(ethers.formatEther(b)).toFixed(4))
    ).catch(() => setTreasuryBalance("error"));

    fetch("/api/admin/withdraw")
      .then(r => r.json())
      .then(d => setInferenceBalance(d.inferenceBalance))
      .catch(() => {});
  }, [isAdmin]);

  const withdraw = async () => {
    setError("");
    setTxHash(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress, to: to || walletAddress, amount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTxHash(data.txHash);
      setAmount("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "withdrawal failed");
    } finally {
      setLoading(false);
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <p className="text-[#444] text-sm font-mono">connect wallet to continue</p>
          <button
            onClick={login}
            className="px-6 py-3 bg-white text-black text-xs font-mono font-bold rounded-lg"
          >
            connect wallet →
          </button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-[#333] text-sm font-mono">unauthorized.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-mono">
      <nav className="flex items-center justify-between px-6 py-5 border-b border-[#111]">
        <Link href="/">
          <Image src="/logo-lockup.png" alt="Persora." width={120} height={32} className="h-7 w-auto" />
        </Link>
        <span className="text-[#444] text-xs">admin</span>
      </nav>

      <main className="max-w-lg mx-auto px-6 py-16 flex flex-col gap-8">
        {/* Treasury balance */}
        <div className="border border-[#1a1a1a] rounded-xl bg-[#0d0d0d] p-6 flex flex-col gap-2">
          <span className="text-[#444] text-xs">// treasury balance</span>
          <span className="text-4xl font-black">
            {treasuryBalance ?? "..."} <span className="text-xl text-[#444]">A0GI</span>
          </span>
          <span className="text-[#333] text-xs">{TREASURY}</span>
        </div>

        <div className="border border-[#1a1a1a] rounded-xl bg-[#0d0d0d] p-6 flex flex-col gap-2">
          <span className="text-[#444] text-xs">// inference balance (estimated)</span>
          <span className="text-2xl font-black">
            {inferenceBalance === null ? "..." : inferenceBalance.toFixed(4)}{" "}
            <span className="text-base text-[#444]">A0GI</span>
          </span>
          <span className="text-[#333] text-xs">auto tops up at 1 A0GI · refills with 5 A0GI</span>
        </div>

        {/* Withdraw */}
        <div className="border border-[#1a1a1a] rounded-xl bg-[#0d0d0d] p-6 flex flex-col gap-4">
          <span className="text-[#444] text-xs">// withdraw funds</span>

          <div className="flex flex-col gap-2">
            <span className="text-[#555] text-xs">amount (A0GI)</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="bg-[#111] border border-[#1a1a1a] rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-[#333]"
            />
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[#555] text-xs">destination (leave blank to send to your wallet)</span>
            <input
              type="text"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder={walletAddress ?? "0x..."}
              className="bg-[#111] border border-[#1a1a1a] rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-[#333] font-mono"
            />
          </div>

          <button
            onClick={withdraw}
            disabled={loading || !amount}
            className="px-4 py-3 bg-white text-black text-xs font-bold rounded-lg disabled:opacity-20 hover:bg-[#e0e0e0] transition-colors"
          >
            {loading ? "sending…" : "withdraw →"}
          </button>

          {error && (
            <p className="text-[#666] text-xs border border-[#1a1a1a] rounded px-3 py-2">
              error: {error}
            </p>
          )}

          {txHash && (
            <a
              href={`https://chainscan-galileo.0g.ai/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[#555] text-xs hover:text-[#888] transition-colors"
            >
              <ArrowUpRight size={12} />
              view on 0G explorer
            </a>
          )}
        </div>
      </main>
    </div>
  );
}
