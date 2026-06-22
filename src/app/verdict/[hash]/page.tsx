import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { retrieveVerdict, buildStorageScanUrl, buildShareUrl } from "@/lib/storage";
import type { Verdict } from "@/lib/agents";
import { VerdictActions } from "@/components/ui/verdict-actions";
import { ShareCard } from "@/components/ui/share-card";

interface Props {
  params: Promise<{ hash: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { hash } = await params;
  const verdict = await retrieveVerdict(decodeURIComponent(hash));

  if (!verdict) {
    return { title: "Verdict not found — Persora." };
  }

  const label =
    verdict.consensus === "YES"
      ? "LIKELY"
      : verdict.consensus === "NO"
      ? "UNLIKELY"
      : "UNCERTAIN";

  return {
    title: `${label} (${verdict.confidenceScore}%) — Persora.`,
    description: `"${verdict.question}" — ${verdict.summary}`,
    openGraph: {
      title: `${label} · ${verdict.confidenceScore}% confidence`,
      description: `"${verdict.question}" — ${verdict.summary}`,
      siteName: "Persora.",
    },
    twitter: {
      card: "summary",
      title: `${label} · ${verdict.confidenceScore}% confidence`,
      description: `"${verdict.question}" — ${verdict.summary}`,
    },
  };
}

function leanLabel(lean: string) {
  if (lean === "YES") return { text: "YES", cls: "text-white" };
  if (lean === "NO") return { text: "NO", cls: "text-[#666]" };
  return { text: "???", cls: "text-[#444]" };
}

function consensusDisplay(c: string) {
  if (c === "YES") return { label: "LIKELY", cls: "text-white" };
  if (c === "NO") return { label: "UNLIKELY", cls: "text-[#777]" };
  return { label: "UNCERTAIN", cls: "text-[#555]" };
}

function NotFound({ hash }: { hash: string }) {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <nav className="flex items-center justify-between px-6 py-5 border-b border-[#111]">
        <Link href="/">
          <Image src="/logo-lockup.png" alt="Persora" width={120} height={32} className="h-7 w-auto" />
        </Link>
        <span className="text-[#444] text-sm font-mono">powered by 0G</span>
      </nav>
      <main className="flex-1 flex flex-col items-center justify-center px-4 gap-6 text-center">
        <div className="flex flex-col gap-3">
          <p className="text-[#333] text-xs font-mono">verdict hash</p>
          <p className="text-[#222] text-xs font-mono break-all max-w-sm">{hash}</p>
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-4xl font-black text-[#333]">NOT FOUND</p>
          <p className="text-[#444] text-sm max-w-sm">
            This verdict may still be propagating on the 0G network, or the hash is invalid.
          </p>
        </div>
        <Link
          href="/predict"
          className="px-6 py-3 bg-white text-black rounded-xl text-sm font-semibold hover:bg-[#e0e0e0] transition-colors"
        >
          Ask your own question
        </Link>
      </main>
    </div>
  );
}

export default async function VerdictPage({ params }: Props) {
  const { hash } = await params;
  const rootHash = decodeURIComponent(hash);
  const verdict: Verdict | null = await retrieveVerdict(rootHash);

  if (!verdict) return <NotFound hash={rootHash} />;

  const { label, cls } = consensusDisplay(verdict.consensus);
  const scanUrl = buildStorageScanUrl(rootHash);
  const shareUrl = buildShareUrl(rootHash);
  const shortHash = `${rootHash.slice(0, 10)}…${rootHash.slice(-6)}`;
  const date = new Date(verdict.timestamp).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <nav className="flex items-center justify-between px-6 py-5 border-b border-[#111]">
        <Link href="/">
          <Image src="/logo-lockup.png" alt="Persora" width={120} height={32} className="h-7 w-auto" />
        </Link>
        <span className="text-[#444] text-sm font-mono">powered by 0G</span>
      </nav>

      <main className="flex-1 flex flex-col items-center px-4 py-16">
        <div id="verdict-card" className="w-full max-w-2xl flex flex-col gap-6">

          {/* Question */}
          <div>
            <p className="text-[#444] text-xs font-mono mb-1">question</p>
            <p className="text-xl font-bold leading-snug">{verdict.question}</p>
          </div>

          {/* Verdict banner */}
          <div className="border border-[#1a1a1a] rounded-2xl p-6 bg-[#0d0d0d] flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1.5">
              <p className="text-[#666] text-xs font-mono">verdict</p>
              {verdict.pick && !["YES", "NO", "UNCERTAIN"].includes(verdict.pick) ? (
                <>
                  <p className="text-5xl font-black tracking-tight text-white leading-none">
                    {verdict.pick}
                  </p>
                  <p className={`text-xs font-mono tracking-widest uppercase mt-1 ${cls}`}>{label}</p>
                </>
              ) : (
                <p className={`text-5xl font-black tracking-tight ${cls}`}>{label}</p>
              )}
              <p className="text-[#888] text-sm leading-relaxed max-w-xs mt-2">{verdict.summary}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[#666] text-xs font-mono mb-1">confidence</p>
              <p className="text-5xl font-black">
                {verdict.confidenceScore}
                <span className="text-2xl text-[#666]">%</span>
              </p>
            </div>
          </div>

          {/* Agent breakdown */}
          <div className="flex flex-col gap-2">
            <p className="text-[#444] text-xs font-mono">agent breakdown</p>
            {verdict.agents.map((agent) => {
              const lean = leanLabel(agent.lean);
              return (
                <div
                  key={agent.agentId}
                  className="border border-[#1a1a1a] rounded-xl p-4 bg-[#0a0a0a] flex flex-col gap-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">{agent.name}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-mono font-bold ${lean.cls}`}>{lean.text}</span>
                      <span className="text-[#333] text-xs font-mono">{agent.confidence}%</span>
                    </div>
                  </div>
                  <p className="text-[#666] text-sm leading-relaxed">{agent.reasoning}</p>
                </div>
              );
            })}
          </div>

          {/* On-chain proof */}
          <div className="border border-[#1a1a1a] rounded-xl p-4 bg-[#0a0a0a]">
            <div className="flex items-center justify-between gap-3 mb-3">
              <p className="text-[#444] text-xs font-mono">on-chain receipt</p>
              <a
                href={scanUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#333] text-xs font-mono hover:text-[#888] transition-colors underline underline-offset-2"
              >
                view on 0G storage ↗
              </a>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-[#555] text-xs font-mono break-all">{rootHash}</p>
              <p className="text-[#333] text-xs font-mono">stored {date} · 0G Testnet · permanent</p>
            </div>
          </div>

          {/* Download + Share */}
          <VerdictActions
            question={verdict.question}
            label={label}
            confidenceScore={verdict.confidenceScore}
            shareUrl={shareUrl}
            cardId="share-card"
          />

          {/* Divider + CTA */}
          <div className="flex items-center gap-4 pt-2">
            <div className="flex-1 h-px bg-[#111]" />
            <p className="text-[#333] text-xs font-mono shrink-0">want your own receipt?</p>
            <div className="flex-1 h-px bg-[#111]" />
          </div>

          <Link
            href="/predict"
            className="w-full py-3 bg-white text-black rounded-xl text-sm font-semibold text-center hover:bg-[#e0e0e0] transition-colors"
          >
            Ask a question on Persora.
          </Link>

          <p className="text-center text-[#222] text-xs font-mono">
            verdicts are permanent. receipts don&apos;t lie.
          </p>
        </div>
      </main>

      {/* Hidden share card — captured by html2canvas for download */}
      <div
        id="share-card"
        style={{ position: "absolute", left: "-9999px", top: 0 }}
        aria-hidden="true"
      >
        <ShareCard
          question={verdict.question}
          label={label}
          confidenceScore={verdict.confidenceScore}
          summary={verdict.summary}
          agents={verdict.agents.map((a) => ({
            name: a.name,
            lean: a.lean,
            confidence: a.confidence,
          }))}
          date={date}
          shortHash={shortHash}
        />
      </div>
    </div>
  );
}
