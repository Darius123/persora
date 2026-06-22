"use client";

import { usePrivy } from "@privy-io/react-auth";

export function WalletConnect() {
  const { login } = usePrivy();

  return (
    <div className="flex flex-col items-center gap-5 py-6">
      <div className="flex flex-col gap-1.5 text-center">
        <p className="text-[#888] text-sm font-mono">connect your wallet to predict</p>
        <p className="text-[#444] text-xs font-mono">
          each prediction costs $0.02 · paid in A0GI on 0G
        </p>
      </div>
      <button
        onClick={login}
        className="px-6 py-3 bg-white text-black text-xs font-mono font-bold rounded-lg hover:bg-[#e0e0e0] transition-colors"
      >
        connect wallet →
      </button>
    </div>
  );
}

export function WalletBadge({ address }: { address: string }) {
  const { logout } = usePrivy();
  const short = `${address.slice(0, 6)}…${address.slice(-4)}`;

  return (
    <div className="flex items-center gap-2">
      <div className="w-1.5 h-1.5 rounded-full bg-[#28C840]" />
      <span className="text-[#444] text-[10px] font-mono">{short}</span>
      <button
        onClick={logout}
        className="text-[#2a2a2a] text-[10px] font-mono hover:text-[#444] transition-colors"
      >
        ×
      </button>
    </div>
  );
}
