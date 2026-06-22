"use client";

import { useState } from "react";

interface Props {
  question: string;
  label: string;
  confidenceScore: number;
  shareUrl: string;
  cardId: string;
}

export function VerdictActions({ question, label, confidenceScore, shareUrl, cardId }: Props) {
  const [downloading, setDownloading] = useState(false);

  async function downloadCard() {
    setDownloading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const el = document.getElementById(cardId);
      if (!el) return;
      const canvas = await html2canvas(el, {
        backgroundColor: "#000000",
        scale: 2,
        useCORS: true,
        logging: false,
        width: 1200,
        height: 630,
        windowWidth: 1200,
        windowHeight: 630,
      });
      const link = document.createElement("a");
      link.download = `persora-verdict.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally {
      setDownloading(false);
    }
  }

  const tweetText = `"${question}"\n\nVerdict: ${label} · ${confidenceScore}% confidence\n\nReceipt stored permanently on @0G_labs\n\n${shareUrl}`;
  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;

  return (
    <div className="flex gap-3 w-full">
      <button
        onClick={downloadCard}
        disabled={downloading}
        className="flex-1 py-3 border border-[#1a1a1a] bg-[#0d0d0d] text-white rounded-xl text-sm font-mono font-semibold hover:border-[#333] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {downloading ? "capturing…" : "↓ download card"}
      </button>
      <a
        href={tweetUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 py-3 border border-[#1a1a1a] bg-[#0d0d0d] text-white rounded-xl text-sm font-mono font-semibold hover:border-[#333] transition-colors text-center"
      >
        𝕏 share on twitter
      </a>
    </div>
  );
}
