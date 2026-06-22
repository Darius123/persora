"use client";

import { useEffect, useState } from "react";
import { SpotlightCard } from "@/components/ui/spotlight-card";

function Dots() {
  return (
    <span style={{ display: "inline-flex", gap: 3, alignItems: "center" }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 3,
            height: 3,
            borderRadius: "50%",
            backgroundColor: "#555",
            display: "inline-block",
            animation: `dotpulse 1.1s ${i * 0.18}s ease-in-out infinite`,
          }}
        />
      ))}
    </span>
  );
}

// Step 01: agents dispatching
function DuelPreview() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const LOOP = 4200;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const schedule = () => {
      timers.push(setTimeout(() => setTick(1), 350));
      timers.push(setTimeout(() => setTick(2), 900));
      timers.push(setTimeout(() => setTick(3), 1450));
      timers.push(setTimeout(() => setTick(0), LOOP - 200));
    };
    schedule();
    const loop = setInterval(schedule, LOOP);
    return () => { timers.forEach(clearTimeout); clearInterval(loop); };
  }, []);

  const agents = [
    { id: "analyst",   stance: "bullish" },
    { id: "skeptic",   stance: "bearish" },
    { id: "historian", stance: "neutral" },
  ];

  return (
    <div style={{
      padding: 16, background: "#050505", border: "1px solid #1a1a1a",
      borderRadius: 8, fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
      display: "flex", flexDirection: "column", gap: 7,
    }}>
      <span style={{ color: "#333", marginBottom: 2, fontSize: 10 }}>$ dispatching agents</span>
      {agents.map((a, i) => (
        <div
          key={a.id}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            opacity: tick > i ? 1 : 0,
            transform: tick > i ? "translateX(0)" : "translateX(-6px)",
            transition: "opacity 0.35s ease, transform 0.35s ease",
          }}
        >
          <span style={{ color: "#333" }}>›</span>
          <span style={{ color: "#555" }}>[</span>
          <span style={{ color: "#999" }}>{a.id}</span>
          <span style={{ color: "#555" }}>]</span>
          <span style={{ color: "#444", flex: 1, marginLeft: 4 }}>{a.stance}</span>
          {tick > i && <Dots />}
        </div>
      ))}
    </div>
  );
}

// Step 02: bars filling → verdict
function VerdictPreview() {
  const [pct, setPct] = useState([0, 0, 0]);
  const [showVerdict, setShowVerdict] = useState(false);
  const targets = [82, 64, 57];
  const LOOP = 5000;

  useEffect(() => {
    let raf: number;
    let outerTimer: ReturnType<typeof setTimeout>;
    let loopTimer: ReturnType<typeof setInterval>;

    const run = () => {
      setPct([0, 0, 0]);
      setShowVerdict(false);
      const start = Date.now();
      const duration = 1600;
      const animate = () => {
        const t = Math.min((Date.now() - start) / duration, 1);
        const ease = 1 - Math.pow(1 - t, 3);
        setPct(targets.map((v) => Math.round(v * ease)));
        if (t < 1) raf = requestAnimationFrame(animate);
        else outerTimer = setTimeout(() => setShowVerdict(true), 250);
      };
      raf = requestAnimationFrame(animate);
    };

    run();
    loopTimer = setInterval(run, LOOP);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(outerTimer);
      clearInterval(loopTimer);
    };
  }, []);

  const rows = [
    { name: "ANALYST", p: pct[0] },
    { name: "SKEPTIC", p: pct[1] },
    { name: "HISTORIAN", p: pct[2] },
  ];

  return (
    <div style={{
      padding: 16, background: "#050505", border: "1px solid #1a1a1a",
      borderRadius: 8, fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
      display: "flex", flexDirection: "column", gap: 9,
    }}>
      {rows.map((r) => (
        <div key={r.name} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <div style={{ display: "flex", justifyContent: "space-between", color: "#555" }}>
            <span>{r.name}</span>
            <span>{r.p}%</span>
          </div>
          <div style={{ height: 2, background: "#111", borderRadius: 2 }}>
            <div style={{ height: "100%", width: `${r.p}%`, background: "#fff", borderRadius: 2 }} />
          </div>
        </div>
      ))}
      <div style={{
        borderTop: "1px solid #1a1a1a", paddingTop: 10,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        opacity: showVerdict ? 1 : 0, transition: "opacity 0.45s ease",
      }}>
        <span style={{
          fontFamily: "'Inter', sans-serif", fontSize: 22, fontWeight: 900,
          color: "#fff", letterSpacing: "-0.04em",
        }}>LIKELY</span>
        <span style={{ color: "#666", fontSize: 10 }}>73% confidence</span>
      </div>
    </div>
  );
}

// Step 03: hash being committed
function ReceiptPreview() {
  const [lines, setLines] = useState(0);
  const LOOP = 5500;
  const ROWS = [
    { label: "encoding",     value: "verdict_v1.json" },
    { label: "hash",         value: "0x4f2b…8e11" },
    { label: "broadcasting", value: "0G testnet" },
    { label: "status",       value: "STORED ✓" },
  ];

  useEffect(() => {
    const run = () => {
      setLines(0);
      [0, 600, 1200, 1900].forEach((delay, i) => {
        setTimeout(() => setLines(i + 1), delay + 200);
      });
    };
    run();
    const loop = setInterval(run, LOOP);
    return () => clearInterval(loop);
  }, []);

  return (
    <div style={{
      padding: 16, background: "#050505", border: "1px solid #1a1a1a",
      borderRadius: 8, fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
      display: "flex", flexDirection: "column", gap: 7,
    }}>
      <span style={{ color: "#333", marginBottom: 2, fontSize: 10 }}>$ commit to 0G storage</span>
      {ROWS.map((row, i) => (
        <div
          key={row.label}
          style={{
            display: "flex", gap: 12,
            opacity: lines > i ? 1 : 0,
            transition: "opacity 0.3s ease",
          }}
        >
          <span style={{ color: "#444", minWidth: 88 }}>{row.label}</span>
          <span style={{ color: i === 3 ? "#fff" : "#777" }}>
            {lines === i + 1 && i < 3 ? <Dots /> : row.value}
          </span>
        </div>
      ))}
    </div>
  );
}

const STEPS = [
  {
    num: "01",
    title: "The Duel",
    desc: "Type any yes/no question about the future. Three AI agents — The Analyst, The Skeptic, The Historian — each take a different position and build their case.",
    Preview: DuelPreview,
  },
  {
    num: "02",
    title: "Consensus Engine",
    desc: "A synthesizer reads all three arguments and assigns a final verdict — YES, NO, LIKELY, or UNLIKELY — with a confidence score you can actually trust.",
    Preview: VerdictPreview,
  },
  {
    num: "03",
    title: "Immutable Receipt",
    desc: "Your prediction is committed to 0G — a decentralized storage network. The timestamp, reasoning, and hash are locked. The record cannot be changed, deleted, or faked.",
    Preview: ReceiptPreview,
  },
];

export function HowItWorksCards() {
  return (
    <>
      <style>{`
        @keyframes dotpulse {
          0%, 100% { opacity: 0.25; transform: scale(0.8); }
          50%       { opacity: 1;    transform: scale(1.1); }
        }
      `}</style>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3,1fr)",
        gap: 24,
      }}>
        {STEPS.map(({ num, title, desc, Preview }) => (
          <SpotlightCard
            key={num}
            style={{
              border: "1px solid #1a1a1a",
              borderRadius: 12,
              backgroundColor: "#0a0a0a",
              padding: 24,
              display: "flex",
              flexDirection: "column",
              gap: 20,
            }}
          >
            {/* animated preview */}
            <Preview />

            {/* step meta */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%",
                  border: "1px solid #333",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#888" }}>{num}</span>
                </div>
                <h3 style={{
                  fontFamily: "'Inter', sans-serif", fontSize: 17,
                  fontWeight: 900, color: "#ffffff", margin: 0,
                }}>{title}</h3>
              </div>
              <p style={{
                fontFamily: "'Inter', sans-serif", fontSize: 13,
                color: "#666", lineHeight: 1.65, margin: 0,
              }}>{desc}</p>
            </div>
          </SpotlightCard>
        ))}
      </div>
    </>
  );
}
