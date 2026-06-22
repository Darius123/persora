"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SplineScene } from "@/components/ui/splite";
import { BackgroundPaths } from "@/components/ui/background-paths";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { VerdictDisplayCards } from "@/components/ui/verdict-display-cards";
import { HowItWorksCards } from "@/components/ui/how-it-works-cards";

const SUBTEXT = "AI agents research, argue, and disagree. A synthesizer delivers the verdict. Every word of reasoning is stored on-chain — and nobody can touch it.";

export default function LandingPage() {
  const [typed, setTyped] = useState("");

  useEffect(() => {
    let i = 0;
    // Small delay so the hero renders first
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        i++;
        setTyped(SUBTEXT.slice(0, i));
        if (i >= SUBTEXT.length) clearInterval(interval);
      }, 18);
      return () => clearInterval(interval);
    }, 600);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="antialiased overflow-x-hidden" style={{ backgroundColor: "#000000", color: "#ffffff", fontFamily: "'Inter', sans-serif" }}>

      <style>{`
        .dot-grid {
          background-image: radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px);
          background-size: 24px 24px;
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
        .animate-pulse-dot { animation: pulse-dot 2s cubic-bezier(0.4,0,0.6,1) infinite; }
        .terminal-border { border: 1px solid #1A1A1A; }
        .progress-bar-bg { background: #1A1A1A; }
        .progress-bar-fill { background: #FFFFFF; }

        @media (max-width: 768px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .hero-spline { display: none !important; }
          .showcase-grid { grid-template-columns: 1fr !important; gap: 48px !important; }
          .showcase-cards { display: none !important; }
          .nav-inner { padding: 12px 20px !important; }
          .nav-powered { display: none !important; }
          .section-pad { padding: 72px 20px !important; }
          .receipt-pad { padding: 28px !important; }
          .receipt-verdict { font-size: 56px !important; }
          .receipt-pick { font-size: 64px !important; }
          .footer-inner { flex-direction: column !important; gap: 32px !important; align-items: flex-start !important; }
          .footer-links { flex-wrap: wrap !important; gap: 20px !important; }
          .manifesto-section { padding: 72px 20px !important; }
        }
      `}</style>

      {/* Nav */}
      <nav className="nav-inner" style={{ position: "fixed", top: 0, left: 0, width: "100%", zIndex: 50, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 32px", backgroundColor: "rgba(0,0,0,0.8)", backdropFilter: "blur(12px)", borderBottom: "1px solid #444748" }}>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 32, fontWeight: 900, color: "#ffffff", letterSpacing: "-0.04em" }}>Persora.</div>
        <div className="nav-powered" style={{ display: "flex", gap: 32, alignItems: "center" }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.05em", color: "#c4c7c8", textTransform: "uppercase" }}>powered by 0G</span>
        </div>
        <Link href="/predict" style={{ backgroundColor: "#ffffff", color: "#000000", fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 700, padding: "8px 24px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
          Launch app
        </Link>
      </nav>

      {/* Hero */}
      <section style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", paddingTop: 80, paddingLeft: 32, paddingRight: 32, overflow: "hidden" }}>
        <BackgroundPaths />
        <div className="hero-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 48, width: "100%", maxWidth: 1280, margin: "0 auto", alignItems: "center" }}>
          {/* Left */}
          <div style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span className="animate-pulse-dot" style={{ width: 8, height: 8, backgroundColor: "#fff", borderRadius: "50%", display: "inline-block" }} />
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.2em", color: "#c4c7c8", textTransform: "uppercase" }}>0G Zero Cup 2026</span>
            </div>
            <h1 style={{ fontFamily: "'Inter', sans-serif", fontSize: "clamp(3.5rem,7vw,6rem)", fontWeight: 900, lineHeight: 1, letterSpacing: "-0.04em", margin: 0, display: "flex", flexDirection: "column" }}>
              <span style={{ color: "#ffffff" }}>AI predictions</span>
              <span style={{ color: "rgba(255,255,255,0.2)" }}>with receipts.</span>
            </h1>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, lineHeight: 1.6, color: "#c4c7c8", maxWidth: 400, minHeight: 80 }}>
              {typed}
              {typed.length < SUBTEXT.length && (
                <span style={{ animation: "none", opacity: 0.5 }}>_</span>
              )}
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 32, paddingTop: 16 }}>
              {[["3", "AI Agents"], ["∞", "Permanent"], ["0G", "On-chain"]].map(([val, label]) => (
                <div key={label} style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 24, fontWeight: 600, color: "#ffffff", lineHeight: 1 }}>{val}</span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#c4c7c8", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 4 }}>{label}</span>
                </div>
              ))}
            </div>
            <div style={{ paddingTop: 16, display: "flex", flexDirection: "column", gap: 16 }}>
              <Link href="/predict" style={{ display: "inline-block", alignSelf: "flex-start", backgroundColor: "#ffffff", color: "#000000", fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 700, padding: "16px 40px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                Ask a question →
              </Link>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "rgba(196,199,200,0.6)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                no account. no wallet. just ask.
              </span>
            </div>
          </div>

          {/* Right: Spline scene */}
          <div className="hero-spline" style={{ position: "relative", height: 600 }}>
            <SplineScene scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode" className="w-full h-full" />
            <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(circle at center, rgba(255,255,255,0.03) 0%, transparent 70%)" }} />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section-pad" style={{ padding: "112px 32px", backgroundColor: "#000000" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ marginBottom: 64 }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#c4c7c8", textTransform: "uppercase", letterSpacing: "0.3em" }}>HOW IT WORKS</span>
            <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: 32, fontWeight: 900, color: "#ffffff", marginTop: 16, letterSpacing: "-0.02em" }}>Three steps. One receipt.</h2>
          </div>
          <HowItWorksCards />
        </div>
      </section>

      {/* Verdict Showcase */}
      <section className="section-pad" style={{ padding: "112px 32px", backgroundColor: "#000000" }}>
        <div className="showcase-grid" style={{ maxWidth: 1280, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
          {/* Left: copy */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#333", textTransform: "uppercase", letterSpacing: "0.3em", margin: 0 }}>
              Any topic. Any context.
            </p>
            <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: "clamp(2rem,4vw,3.5rem)", fontWeight: 900, color: "#ffffff", margin: 0, lineHeight: 1.1, letterSpacing: "-0.04em" }}>
              One format.<br />Every prediction.
            </h2>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: "#555", lineHeight: 1.7, margin: 0, maxWidth: 360 }}>
              Ask about sports, markets, politics, tech — anything with a clear outcome. The receipt looks the same. The proof is permanent. Hover to preview each theme.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 8 }}>
              {[
                ["⚽", "World Cup", "Match odds, tournament context, and a verdict with proof."],
                ["₿", "Crypto", "Price predictions locked on-chain before the move happens."],
                ["◎", "General", "Any question. Permanent proof. Shareable anywhere."],
              ].map(([icon, label, desc]) => (
                <div key={label} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, width: 24 }}>{icon}</span>
                  <div>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#666", textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</span>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#333", margin: "2px 0 0" }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Right: stacked cards */}
          <div className="showcase-cards" style={{ display: "flex", justifyContent: "center", alignItems: "center", paddingBottom: 80 }}>
            <VerdictDisplayCards />
          </div>
        </div>
      </section>

      {/* Sample Verdict */}
      <section className="section-pad" style={{ padding: "112px 32px", backgroundColor: "#0e0e0e" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: 32, fontWeight: 900, color: "#ffffff", marginBottom: 48, textAlign: "center", letterSpacing: "-0.02em" }}>This is what a receipt looks like.</h2>

          <SpotlightCard style={{ width: "100%" }}>
          <div className="receipt-pad terminal-border" style={{ width: "100%", backgroundColor: "#080808", padding: "40px", display: "flex", flexDirection: "column", gap: 0, fontFamily: "'JetBrains Mono', monospace" }}>

            {/* Terminal chrome */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#FF5F57" }} />
              <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#FEBC2E" }} />
              <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#28C840" }} />
              <span style={{ fontSize: 10, color: "#555", marginLeft: 8, textTransform: "lowercase" }}>persora — prediction terminal</span>
            </div>

            {/* Question */}
            <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 28 }}>
              <span style={{ fontSize: 10, color: "#555", textTransform: "uppercase", letterSpacing: "0.1em" }}>// question</span>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 18, fontWeight: 700, color: "#ffffff", letterSpacing: "-0.02em", lineHeight: 1.3 }}>
                &ldquo;Who will win the 2026 World Cup?&rdquo;
              </span>
            </div>

            <div style={{ borderTop: "1px solid #1a1a1a", paddingTop: 28, marginBottom: 28 }}>
              {/* Verdict row */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <span style={{ fontSize: 10, color: "#555", textTransform: "uppercase", letterSpacing: "0.1em" }}>// verdict</span>
                  <span className="receipt-pick" style={{ fontFamily: "'Inter', sans-serif", fontSize: 80, fontWeight: 900, color: "#ffffff", lineHeight: 1, letterSpacing: "-0.04em" }}>Brazil</span>
                  <span style={{ fontSize: 10, color: "#666", textTransform: "uppercase", letterSpacing: "0.2em", marginTop: 2 }}>LIKELY</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, textAlign: "right" }}>
                  <span style={{ fontSize: 10, color: "#555", textTransform: "uppercase", letterSpacing: "0.1em" }}>// confidence</span>
                  <span className="receipt-verdict" style={{ fontFamily: "'Inter', sans-serif", fontSize: 80, fontWeight: 900, color: "#ffffff", lineHeight: 1, letterSpacing: "-0.04em" }}>89%</span>
                </div>
              </div>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#777", marginTop: 16, lineHeight: 1.6 }}>
                Brazil&apos;s five World Cup titles and deep squad depth make them the clear favourite heading into 2026.
              </p>
            </div>

            {/* Agent breakdown */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
              <span style={{ fontSize: 10, color: "#555", textTransform: "uppercase", letterSpacing: "0.1em" }}>// agent breakdown</span>
              {[
                { name: "The Analyst (0G Native)", lean: "YES", pct: 92, reasoning: "Brazil has won five World Cups — more than any nation — and their 2026 squad is their deepest in a decade." },
                { name: "The Skeptic (0G Native)",  lean: "YES", pct: 74, reasoning: "Even as the contrarian: Argentina's grip slips without Messi at his peak. Brazil fills that vacuum." },
                { name: "The Historian (0G Native)", lean: "YES", pct: 88, reasoning: "Teams with 5+ titles historically win again within 12 years. Brazil won in 2002 — 24 years of hunger." },
              ].map((a) => (
                <div key={a.name} style={{ border: "1px solid #111", borderRadius: 8, padding: "12px 14px", backgroundColor: "#060606" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 10, color: "#aaa", fontWeight: 700 }}>{a.name}</span>
                    <div style={{ display: "flex", gap: 12 }}>
                      <span style={{ fontSize: 10, color: "#ffffff", fontWeight: 700 }}>{a.lean}</span>
                      <span style={{ fontSize: 10, color: "#555" }}>{a.pct}%</span>
                    </div>
                  </div>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#666", margin: 0, lineHeight: 1.5 }}>{a.reasoning}</p>
                </div>
              ))}
            </div>

            {/* On-chain proof */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #1a1a1a", paddingTop: 16 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <span style={{ fontSize: 9, color: "#444", textTransform: "uppercase", letterSpacing: "0.1em" }}>stored on 0G network</span>
                <span style={{ fontSize: 9, color: "#333" }}>0x69a90479e0b358f2…e82461c1</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, border: "1px solid #1a1a1a", padding: "6px 12px", borderRadius: 4 }}>
                <span style={{ fontSize: 10, color: "#888" }}>permanent ✓</span>
              </div>
            </div>

          </div>
          </SpotlightCard>

          <Link href="/predict" style={{ marginTop: 48, backgroundColor: "transparent", border: "1px solid #ffffff", color: "#ffffff", fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 700, padding: "16px 40px", textTransform: "uppercase", letterSpacing: "0.1em", display: "inline-block" }}>
            Make your own prediction →
          </Link>
        </div>
      </section>

      {/* Manifesto */}
      <section className="manifesto-section" style={{ padding: "112px 32px", backgroundColor: "#000000", overflow: "hidden", position: "relative" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
          <h2 style={{ display: "flex", flexDirection: "column", gap: 16, margin: 0 }}>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "clamp(2.5rem,6vw,6rem)", fontWeight: 900, color: "rgba(255,255,255,0.2)", lineHeight: 1.1, letterSpacing: "-0.04em" }}>Every verdict is on record.</span>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "clamp(3rem,8vw,8rem)", fontWeight: 900, color: "#ffffff", lineHeight: 1.1, letterSpacing: "-0.04em" }}>The receipt doesn&apos;t lie.</span>
          </h2>
          <div style={{ marginTop: 64 }}>
            <Link href="/predict" style={{ backgroundColor: "transparent", border: "1px solid #444748", color: "#c4c7c8", fontFamily: "'JetBrains Mono', monospace", fontSize: 11, padding: "20px 48px", textTransform: "uppercase", letterSpacing: "0.2em", display: "inline-block", transition: "all 0.2s" }}>
              Ask your first question →
            </Link>
          </div>
        </div>
        <div style={{ position: "absolute", bottom: -96, right: -96, width: 384, height: 384, backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "50%", filter: "blur(120px)", pointerEvents: "none" }} />
      </section>

      {/* Footer */}
      <footer style={{ width: "100%", padding: "48px 32px", backgroundColor: "#000000", borderTop: "1px solid #444748" }}>
        <div className="footer-inner" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 32, fontWeight: 900, color: "rgba(255,255,255,0.2)", letterSpacing: "-0.04em" }}>Persora.</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#c4c7c8", marginTop: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Persora. © 2026</div>
          </div>
          <div className="footer-links" style={{ display: "flex", gap: 32 }}>
            {["How it works", "System status", "Terms of oracle"].map((label) => (
              <a key={label} href="#" style={{ color: "#c4c7c8", fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.05em", textDecoration: "none" }}>{label}</a>
            ))}
          </div>
        </div>
      </footer>

    </div>
  );
}
