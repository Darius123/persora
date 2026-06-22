"use client";

export interface ShareCardProps {
  question: string;
  label: string; // "LIKELY" | "UNLIKELY" | "UNCERTAIN"
  confidenceScore: number;
  summary: string;
  agents: Array<{ name: string; lean: "YES" | "NO" | "UNCERTAIN"; confidence: number }>;
  date: string;
  shortHash: string;
}

// Lean symbol map — compact for the card
function leanMark(lean: "YES" | "NO" | "UNCERTAIN") {
  if (lean === "YES") return { mark: "YES", color: "#ffffff" };
  if (lean === "NO") return { mark: "NO", color: "#555555" };
  return { mark: "???", color: "#444444" };
}

// Ghost verdict word — large, slightly faded, fills the right side
function GhostVerdict({ label }: { label: string }) {
  const color =
    label === "LIKELY" ? "rgba(255,255,255,0.045)" : "rgba(255,255,255,0.03)";
  return (
    <div
      style={{
        position: "absolute",
        right: -20,
        bottom: -30,
        fontSize: 200,
        fontWeight: 900,
        lineHeight: 1,
        letterSpacing: "-0.06em",
        color,
        userSelect: "none",
        pointerEvents: "none",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </div>
  );
}

// Subtle dot-grid background pattern
function DotGrid() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundImage:
          "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
        pointerEvents: "none",
      }}
    />
  );
}

// Horizontal rule divider
function Rule() {
  return (
    <div
      style={{
        width: "100%",
        height: 1,
        backgroundColor: "#1a1a1a",
      }}
    />
  );
}

export function ShareCard({
  question,
  label,
  confidenceScore,
  summary,
  agents,
  date,
  shortHash,
}: ShareCardProps) {
  return (
    <div
      style={{
        width: 1200,
        height: 630,
        backgroundColor: "#000000",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
        color: "#ffffff",
      }}
    >
      {/* Background layers */}
      <DotGrid />
      <GhostVerdict label={label} />

      {/* Subtle top glow */}
      <div
        style={{
          position: "absolute",
          top: -120,
          left: "50%",
          transform: "translateX(-50%)",
          width: 600,
          height: 300,
          background:
            "radial-gradient(ellipse at center, rgba(255,255,255,0.03) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Main content — padded container */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          height: "100%",
          padding: "48px 56px 36px 56px",
          gap: 0,
        }}
      >
        {/* TOP ROW — question + confidence score */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 40,
          }}
        >
          {/* Left: label + question */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14 }}>
            {/* QUERY label */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <div
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  backgroundColor: "#444",
                }}
              />
              <span
                style={{
                  fontSize: 11,
                  fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                  color: "#444",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                }}
              >
                prediction query
              </span>
            </div>

            {/* The question */}
            <div
              style={{
                fontSize: 22,
                fontWeight: 700,
                lineHeight: 1.35,
                color: "#ffffff",
                maxWidth: 580,
              }}
            >
              {question.length > 120 ? question.slice(0, 117) + "…" : question}
            </div>
          </div>

          {/* Right: confidence score */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: 4,
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                color: "#444",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              confidence
            </span>
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                lineHeight: 1,
              }}
            >
              <span
                style={{
                  fontSize: 96,
                  fontWeight: 900,
                  color: "#ffffff",
                  letterSpacing: "-0.04em",
                  lineHeight: 1,
                }}
              >
                {confidenceScore}
              </span>
              <span
                style={{
                  fontSize: 40,
                  fontWeight: 700,
                  color: "#333",
                  marginTop: 14,
                  marginLeft: 4,
                }}
              >
                %
              </span>
            </div>
          </div>
        </div>

        {/* SPACER */}
        <div style={{ flex: 1 }} />

        {/* VERDICT ROW — large label + summary */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontFamily: "'JetBrains Mono', 'Courier New', monospace",
              color: "#444",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            verdict
          </span>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 24,
            }}
          >
            <span
              style={{
                fontSize: 80,
                fontWeight: 900,
                letterSpacing: "-0.04em",
                lineHeight: 1,
                color: label === "LIKELY" ? "#ffffff" : label === "UNLIKELY" ? "#666666" : "#555555",
              }}
            >
              {label}
            </span>
            <span
              style={{
                fontSize: 16,
                color: "#666",
                fontStyle: "italic",
                maxWidth: 400,
                lineHeight: 1.4,
              }}
            >
              {summary}
            </span>
          </div>
        </div>

        <div style={{ marginTop: 28, marginBottom: 24 }}>
          <Rule />
        </div>

        {/* AGENT BREAKDOWN — three columns */}
        <div
          style={{
            display: "flex",
            gap: 12,
          }}
        >
          {agents.map((agent, i) => {
            const { mark, color: markColor } = leanMark(agent.lean);
            return (
              <div
                key={i}
                style={{
                  flex: 1,
                  backgroundColor: "#0d0d0d",
                  border: "1px solid #1a1a1a",
                  borderRadius: 10,
                  padding: "12px 16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                {/* Agent name */}
                <span
                  style={{
                    fontSize: 11,
                    fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                    color: "#555",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  {agent.name}
                </span>

                {/* Lean + confidence */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span
                    style={{
                      fontSize: 20,
                      fontWeight: 800,
                      color: markColor,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {mark}
                  </span>
                  <span
                    style={{
                      fontSize: 13,
                      fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                      color: "#444",
                    }}
                  >
                    {agent.confidence}%
                  </span>
                </div>

                {/* Confidence bar */}
                <div
                  style={{
                    width: "100%",
                    height: 2,
                    backgroundColor: "#1a1a1a",
                    borderRadius: 1,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${agent.confidence}%`,
                      height: "100%",
                      backgroundColor: agent.lean === "YES" ? "#ffffff" : "#333333",
                      borderRadius: 1,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 20, marginBottom: 18 }}>
          <Rule />
        </div>

        {/* FOOTER ROW */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Wordmark left */}
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <span
              style={{
                fontSize: 22,
                fontWeight: 900,
                color: "#ffffff",
                letterSpacing: "-0.03em",
              }}
            >
              Persora.
            </span>
            <span
              style={{
                fontSize: 11,
                fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                color: "#333",
                letterSpacing: "0.06em",
              }}
            >
              ai predictions with receipts
            </span>
          </div>

          {/* Center: hash */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
            }}
          >
            <span
              style={{
                fontSize: 10,
                fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                color: "#2a2a2a",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              on-chain receipt
            </span>
            <span
              style={{
                fontSize: 11,
                fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                color: "#2e2e2e",
              }}
            >
              {shortHash}
            </span>
          </div>

          {/* Right: 0G + date */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: 3,
            }}
          >
            <span
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "#333",
                letterSpacing: "0.04em",
              }}
            >
              powered by 0G
            </span>
            <span
              style={{
                fontSize: 11,
                fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                color: "#2e2e2e",
              }}
            >
              {date}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
