"use client";

import { cn } from "@/lib/utils";

interface AgentBar {
  name: string;
  pct: number;
}

interface VerdictCardProps {
  className?: string;
  theme: "worldcup" | "crypto" | "general";
  question: string;
  verdict: string;
  confidence: number;
  agents: AgentBar[];
}

const THEMES = {
  worldcup: {
    bg: "#071a10",
    border: "#0f3320",
    accent: "#16a34a",
    accentDim: "rgba(22,163,74,0.12)",
    label: "⚽  FIFA 2026",
    textPrimary: "#ffffff",
    textMuted: "#3d7a52",
    barBg: "#0f2d1a",
  },
  crypto: {
    bg: "#110800",
    border: "#2e1800",
    accent: "#f97316",
    accentDim: "rgba(249,115,22,0.12)",
    label: "₿  Crypto",
    textPrimary: "#ffffff",
    textMuted: "#6b3a10",
    barBg: "#1f1000",
  },
  general: {
    bg: "#ffffff",
    border: "#e5e7eb",
    accent: "#111111",
    accentDim: "rgba(0,0,0,0.05)",
    label: "◎  General",
    textPrimary: "#111111",
    textMuted: "#9ca3af",
    barBg: "#f3f4f6",
  },
};

function VerdictCard({ className, theme, question, verdict, confidence, agents }: VerdictCardProps) {
  const t = THEMES[theme];

  return (
    <div
      className={cn(
        "relative select-none flex flex-col gap-4 rounded-2xl border p-5 transition-all duration-700",
        "[width:22rem] -skew-y-[8deg]",
        "[&>*]:flex [&>*]:items-center [&>*]:gap-2",
        className
      )}
      style={{ backgroundColor: t.bg, borderColor: t.border, height: "auto" }}
    >
      {/* Header row */}
      <div style={{ justifyContent: "space-between" }}>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10,
          color: t.accent,
          backgroundColor: t.accentDim,
          padding: "3px 10px",
          borderRadius: 6,
          textTransform: "uppercase",
          letterSpacing: "0.12em",
        }}>
          {t.label}
        </span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: t.textMuted, letterSpacing: "0.1em" }}>
          VERIFIED ✓
        </span>
      </div>

      {/* Question */}
      <div style={{ display: "block" }}>
        <p style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 13,
          fontWeight: 700,
          color: t.textPrimary,
          lineHeight: 1.4,
          margin: 0,
        }}>
          {question}
        </p>
      </div>

      {/* Verdict + Confidence */}
      <div style={{ justifyContent: "space-between", alignItems: "flex-end" }}>
        <div style={{ flexDirection: "column", alignItems: "flex-start", gap: 0 }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            verdict
          </span>
          <span style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 40,
            fontWeight: 900,
            color: t.accent,
            lineHeight: 1,
            letterSpacing: "-0.04em",
            display: "block",
          }}>
            {verdict}
          </span>
        </div>
        <div style={{ flexDirection: "column", alignItems: "flex-end", gap: 0 }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            confidence
          </span>
          <span style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 40,
            fontWeight: 900,
            color: t.textPrimary,
            lineHeight: 1,
            letterSpacing: "-0.04em",
            display: "block",
          }}>
            {confidence}%
          </span>
        </div>
      </div>

      {/* Agent bars */}
      <div style={{ flexDirection: "column", gap: 8, alignItems: "stretch" }}>
        {agents.map((a) => (
          <div key={a.name} style={{ flexDirection: "column", gap: 3, alignItems: "stretch" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: t.textMuted, textTransform: "uppercase" }}>{a.name}</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: t.textMuted }}>{a.pct}%</span>
            </div>
            <div style={{ width: "100%", height: 2, backgroundColor: t.barBg, borderRadius: 2 }}>
              <div style={{ width: `${a.pct}%`, height: "100%", backgroundColor: t.accent, borderRadius: 2, opacity: 0.8 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const CARDS: VerdictCardProps[] = [
  {
    theme: "worldcup",
    question: "Will Argentina defend the World Cup title at USA 2026?",
    verdict: "LIKELY",
    confidence: 71,
    agents: [
      { name: "AGENT_ALPHA", pct: 82 },
      { name: "AGENT_BETA",  pct: 68 },
      { name: "AGENT_GAMMA", pct: 62 },
    ],
    className: [
      "[grid-area:stack]",
      "hover:-translate-y-10",
      "before:absolute before:w-full before:h-full before:rounded-2xl",
      "before:content-[''] before:bg-black/60 before:top-0 before:left-0",
      "before:transition-opacity before:duration-700",
      "grayscale hover:grayscale-0 hover:before:opacity-0",
    ].join(" "),
  },
  {
    theme: "crypto",
    question: "Will Bitcoin hit $200K before end of 2026?",
    verdict: "LIKELY",
    confidence: 73,
    agents: [
      { name: "AGENT_ALPHA", pct: 92 },
      { name: "AGENT_BETA",  pct: 64 },
      { name: "AGENT_GAMMA", pct: 14 },
    ],
    className: [
      "[grid-area:stack]",
      "translate-x-16 translate-y-10",
      "hover:-translate-y-1",
      "before:absolute before:w-full before:h-full before:rounded-2xl",
      "before:content-[''] before:bg-black/60 before:top-0 before:left-0",
      "before:transition-opacity before:duration-700",
      "grayscale hover:grayscale-0 hover:before:opacity-0",
    ].join(" "),
  },
  {
    theme: "general",
    question: "Will OpenAI launch a consumer hardware product before 2027?",
    verdict: "UNLIKELY",
    confidence: 34,
    agents: [
      { name: "AGENT_ALPHA", pct: 41 },
      { name: "AGENT_BETA",  pct: 30 },
      { name: "AGENT_GAMMA", pct: 28 },
    ],
    className: [
      "[grid-area:stack]",
      "translate-x-32 translate-y-20",
      "hover:translate-y-10",
    ].join(" "),
  },
];

export function VerdictDisplayCards() {
  return (
    <div className="grid [grid-template-areas:'stack'] place-items-center animate-in fade-in-0 duration-700">
      {CARDS.map((card, i) => (
        <VerdictCard key={i} {...card} />
      ))}
    </div>
  );
}
