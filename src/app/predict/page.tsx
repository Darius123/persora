"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, ExternalLink, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import AgentPlan from "@/components/ui/agent-plan";
import { BackgroundPaths } from "@/components/ui/background-paths";
import { BorderBeam } from "@/components/ui/border-beam";
import { WalletConnect, WalletBadge } from "@/components/ui/credit-gate";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { ethers } from "ethers";
import { PREDICTION_COST_USD } from "@/lib/payment";

interface AgentResult {
  agentId: string;
  name: string;
  reasoning: string;
  lean: "YES" | "NO" | "UNCERTAIN";
  confidence: number;
}

interface Verdict {
  question: string;
  agents: AgentResult[];
  consensus: "YES" | "NO" | "UNCERTAIN";
  confidenceScore: number;
  summary: string;
  pick?: string;
  timestamp: string;
}

interface PredictResponse {
  verdict: Verdict;
  rootHash: string;
  shareUrl: string;
  storageScanUrl: string;
}

const EXAMPLES = [
  "Will Bitcoin hit $200K before end of 2026?",
  "Will Argentina win the 2026 World Cup?",
  "Will the US enter a recession by Q4 2026?",
  "Will OpenAI release GPT-5 before July 2026?",
];

interface ModelOption {
  id: string;
  name: string;
  description: string;
  available: boolean;
}

function agentSlug(name: string) {
  return name.toLowerCase().replace(/^the\s+/, "");
}

function leanColor(lean: string) {
  if (lean === "YES") return "text-white";
  if (lean === "NO") return "text-[#888]";
  return "text-[#777]";
}

function consensusData(c: string) {
  if (c === "YES") return { label: "LIKELY", color: "text-white" };
  if (c === "NO") return { label: "UNLIKELY", color: "text-[#999]" };
  return { label: "UNCERTAIN", color: "text-[#777]" };
}

function Cursor() {
  return (
    <motion.span
      animate={{ opacity: [1, 0] }}
      transition={{ duration: 0.6, repeat: Infinity, repeatType: "reverse" }}
      className="inline-block w-2 h-4 bg-white ml-0.5 align-middle"
    />
  );
}

function NumberTicker({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const duration = 900;
    const start = Date.now();
    const tick = () => {
      const t = Math.min((Date.now() - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(value * ease));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [value]);
  return <>{display}</>;
}

function TermLine({
  children,
  delay = 0,
  dim = false,
  prefix = ">",
}: {
  children: React.ReactNode;
  delay?: number;
  dim?: boolean;
  prefix?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -4 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.18 }}
      className={`flex gap-2 font-mono text-sm ${dim ? "text-[#777]" : "text-[#bbb]"}`}
    >
      <span className="text-[#666] select-none shrink-0">{prefix}</span>
      <span>{children}</span>
    </motion.div>
  );
}

export default function PredictPage() {
  const { authenticated } = usePrivy();
  const { wallets } = useWallets();
  const wallet = wallets[0];
  const walletAddress = wallet?.address ?? null;

  const [question, setQuestion] = useState("");
  const [phase, setPhase] = useState<"idle" | "loading" | "done">("idle");
  const [result, setResult] = useState<PredictResponse | null>(null);
  const [error, setError] = useState("");
  const [paying, setPaying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [balance, setBalance] = useState<string | null>(null);
  const [costA0GI, setCostA0GI] = useState<number | null>(null);
  const [availableModels, setAvailableModels] = useState<ModelOption[]>([]);
  const [extraModels, setExtraModels] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchBalance = async (address: string) => {
    try {
      const provider = new ethers.JsonRpcProvider("https://evmrpc-testnet.0g.ai");
      const raw = await provider.getBalance(address);
      setBalance(parseFloat(ethers.formatEther(raw)).toFixed(3));
    } catch {
      // silently fail — balance is cosmetic
    }
  };

  useEffect(() => {
    if (walletAddress) fetchBalance(walletAddress);
  }, [walletAddress]);

  useEffect(() => {
    fetch("/api/price")
      .then((r) => r.json())
      .then((d) => setCostA0GI(d.requiredA0GI))
      .catch(() => setCostA0GI(null));
  }, []);

  useEffect(() => {
    fetch("/api/models")
      .then((r) => r.json())
      .then((d: { models: ModelOption[] }) => {
        // Show add-on models only (exclude 0g-native — it's always in core)
        setAvailableModels(d.models.filter((m) => m.id !== "0g-native"));
      })
      .catch(() => {});
  }, []);

  const toggleExtra = (id: string) => {
    setExtraModels((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    if (phase === "loading") {
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase]);

  const submit = async (q?: string) => {
    const query = (q || question).trim();
    if (!query || phase === "loading" || paying) return;
    if (q) setQuestion(q);
    setError("");
    setResult(null);

    let txHash: string | undefined;

    // If treasury is configured and wallet is connected, collect payment first
    const treasury = process.env.NEXT_PUBLIC_TREASURY_ADDRESS;
    if (treasury && wallet) {
      try {
        setPaying(true);
        const cost = costA0GI ?? (await fetch("/api/price").then(r => r.json()).then(d => d.requiredA0GI));
        const provider = await wallet.getEthereumProvider();
        type RPC = { request: (a: object) => Promise<unknown> };
        const rpc = provider as unknown as RPC;
        // Try to switch — if chain not added, add it; swallow all other errors and check chain below
        try {
          await rpc.request({ method: "wallet_switchEthereumChain", params: [{ chainId: "0x40DA" }] });
        } catch (switchErr: unknown) {
          const code = (switchErr as { code?: number })?.code;
          if (code === 4902) {
            try {
              await rpc.request({
                method: "wallet_addEthereumChain",
                params: [{ chainId: "0x40DA", chainName: "0G Testnet", nativeCurrency: { name: "0G Token", symbol: "A0GI", decimals: 18 }, rpcUrls: ["https://evmrpc-testnet.0g.ai"], blockExplorerUrls: ["https://chainscan-galileo.0g.ai"] }],
              });
            } catch { /* add failed — chain check below will catch if still wrong */ }
          }
          // For all other errors (user rejected, wrong RPC config, etc.) — fall through to chain check
        }
        // Verify we're actually on the right chain before signing
        const currentChain = await rpc.request({ method: "eth_chainId", params: [] }) as string;
        if (parseInt(currentChain, 16) !== 16602) {
          throw new Error(
            `Wrong network. In MetaMask: remove the old "0G Testnet" network, then reconnect here to add the correct one (chain 16602).`
          );
        }
        const valueHex = "0x" + ethers.parseEther(cost.toString()).toString(16);
        const hash = await rpc.request({
          method: "eth_sendTransaction",
          params: [{ from: walletAddress, to: treasury, value: valueHex }],
        }) as string;
        txHash = hash as string;
        setPaying(false);
        if (walletAddress) fetchBalance(walletAddress);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : JSON.stringify(err);
        console.error("[payment error]", err);
        setError(`payment failed: ${msg}`);
        setPaying(false);
        return;
      }
    }

    setPhase("loading");

    try {
      const res = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: query, walletAddress, txHash, extraModels }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed");
      }
      const data: PredictResponse = await res.json();
      setResult(data);
      setPhase("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "prediction failed. try again.");
      setPhase("idle");
    }
  };

  const reset = () => {
    setPhase("idle");
    setResult(null);
    setQuestion("");
    setError("");
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const copyLink = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const { label: cLabel, color: cColor } = result
    ? consensusData(result.verdict.consensus)
    : { label: "", color: "" };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-mono relative overflow-hidden">
      <BackgroundPaths />
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 border-b border-[#111]">
        <Link href="/">
          <Image
            src="/logo-lockup.png"
            alt="Persora."
            width={120}
            height={32}
            className="h-7 w-auto"
          />
        </Link>
        <div className="flex items-center gap-3">
          {walletAddress && <WalletBadge address={walletAddress} />}
          <span className="text-[#666] text-sm">predict terminal</span>
        </div>
      </nav>

      {/* Terminal container */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 relative z-10">
        {/* glow halo behind terminal */}
        <div className="absolute pointer-events-none" style={{
          width: 700, height: 500,
          background: "radial-gradient(ellipse at center, rgba(255,255,255,0.04) 0%, transparent 70%)",
          top: "50%", left: "50%", transform: "translate(-50%, -50%)",
        }} />
        <div className="w-full max-w-2xl flex flex-col gap-0 relative rounded-2xl border border-[#1a1a1a] overflow-hidden">
          <BorderBeam size={300} duration={7} colorFrom="#ffffff" colorTo="transparent" borderWidth={1} />

          {/* Terminal chrome bar */}
          <div className="bg-[#0d0d0d] px-4 py-3 flex items-center gap-2 border-b border-[#1a1a1a]">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#FF5F57" }} />
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#FEBC2E" }} />
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#28C840" }} />
            <span className="text-[#666] text-xs ml-3 flex-1">persora — prediction terminal</span>
            <div className="flex items-center gap-4">
              {balance !== null && (
                <span className="text-[#666] font-mono" style={{ fontSize: 10 }}>
                  {balance} A0GI
                </span>
              )}
              {["analyst", "skeptic", "historian", ...extraModels].map((id, i) => (
                <div key={id} className="flex items-center gap-1.5">
                  <motion.div
                    className="w-1.5 h-1.5 rounded-full bg-[#28C840]"
                    animate={{ opacity: [1, 0.35, 1] }}
                    transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.7 }}
                  />
                  <span className="text-[#666] font-mono" style={{ fontSize: 9 }}>
                    {availableModels.find((m) => m.id === id)?.name?.toLowerCase() ?? id}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Terminal body */}
          <div className="bg-[#050505] p-6 flex flex-col gap-5 min-h-[460px]">
            <AnimatePresence mode="wait">

              {/* IDLE */}
              {phase === "idle" && (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col gap-5"
                >
                  <div className="flex flex-col gap-1.5">
                    <TermLine delay={0} dim>Persora. v1.0 — AI prediction arena</TermLine>
                    <TermLine delay={0.06} dim>connected to 0G Compute network</TermLine>
                    <TermLine delay={0.12} dim>
                      {`core: analyst · skeptic · historian${extraModels.length > 0 ? ` + ${extraModels.map(id => availableModels.find(m => m.id === id)?.name ?? id).join(", ").toLowerCase()}` : ""}`}
                    </TermLine>
                  </div>

                  <div className="h-px bg-[#111]" />

                  {/* Wallet gate */}
                  {!authenticated || !walletAddress ? (
                    <WalletConnect />
                  ) : (
                    <>
                      {balance !== null && costA0GI !== null && parseFloat(balance) < costA0GI && (
                        <div className="flex items-center justify-between border border-[#1a1a1a] rounded-lg px-3 py-2.5 bg-[#0d0d0d]">
                          <span className="text-[#888] text-xs font-mono">
                            insufficient balance · need {costA0GI} A0GI (~$0.02)
                          </span>
                          <a
                            href="https://faucet.0g.ai"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#777] text-xs hover:text-[#aaa] transition-colors flex items-center gap-1"
                          >
                            get A0GI <ArrowUpRight size={10} />
                          </a>
                        </div>
                      )}

                      {/* Core agents — always on */}
                  <div className="flex flex-col gap-2">
                    <span className="text-[#666] text-xs">// core agents — always active</span>
                    <div className="flex gap-2">
                      {["The Analyst", "The Skeptic", "The Historian"].map((name) => (
                        <div key={name} className="flex items-center gap-1.5 px-3 py-2 border border-[#1a1a1a] rounded-lg bg-[#0d0d0d]">
                          <div className="w-1 h-1 rounded-full bg-[#28C840]" />
                          <span className="text-[#aaa] font-mono text-xs">{name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Extra AI add-ons */}
                  {availableModels.length > 0 && (
                    <div className="flex flex-col gap-2">
                      <span className="text-[#666] text-xs">// add AI to the debate (optional)</span>
                      <div className="flex gap-2 flex-wrap">
                        {availableModels.map((model) => {
                          const active = extraModels.includes(model.id);
                          return (
                            <button
                              key={model.id}
                              onClick={() => model.available && toggleExtra(model.id)}
                              disabled={!model.available}
                              className={`flex flex-col gap-0.5 px-3 py-2 border rounded-lg text-left transition-colors ${
                                !model.available
                                  ? "border-[#111] opacity-30 cursor-not-allowed"
                                  : active
                                  ? "border-[#555] bg-[#0d0d0d]"
                                  : "border-[#1a1a1a] hover:border-[#333]"
                              }`}
                            >
                              <span className={`text-xs font-bold font-mono ${active ? "text-white" : "text-[#888]"}`}>
                                {model.name}{active && <span className="ml-1.5 text-[#777]">✓</span>}
                              </span>
                              <span className="text-[#666] font-mono" style={{ fontSize: 9 }}>
                                {model.available ? model.description : "add api key to enable"}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-3">
                        <span className="text-[#666] text-xs">// enter your prediction question</span>
                        <div className="flex items-center gap-2 border border-[#1a1a1a] rounded-xl p-3 bg-[#0d0d0d] focus-within:border-[#333] transition-colors">
                          <span className="text-[#777] select-none shrink-0">$</span>
                          <input
                            ref={inputRef}
                            type="text"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && submit()}
                            placeholder="will X happen by Y date?"
                            className="flex-1 bg-transparent text-white placeholder:text-[#444] text-sm outline-none font-mono"
                            autoFocus
                          />
                          <Cursor />
                        </div>
                        <button
                          onClick={() => submit()}
                          disabled={!question.trim() || paying}
                          className="self-start px-4 py-2 bg-white text-black text-xs font-mono font-bold rounded-lg disabled:opacity-20 disabled:cursor-not-allowed hover:bg-[#e0e0e0] transition-colors"
                        >
                          {paying ? "sign payment in wallet…" : "run prediction →"}
                        </button>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <span className="text-[#666] text-xs">// examples</span>
                        {EXAMPLES.map((ex, i) => (
                          <motion.button
                            key={ex}
                            initial={{ opacity: 0, x: -4 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 + i * 0.06 }}
                            onClick={() => submit(ex)}
                            className="text-left text-[#777] text-xs hover:text-[#bbb] transition-colors pl-4 border-l border-[#222] hover:border-[#444]"
                          >
                            {ex}
                          </motion.button>
                        ))}
                      </div>

                      {error && (
                        <p className="text-[#888] text-xs border border-[#1a1a1a] rounded px-3 py-2">
                          error: {error}
                        </p>
                      )}
                    </>
                  )}
                </motion.div>
              )}

              {/* LOADING */}
              {phase === "loading" && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col gap-5"
                >
                  <div className="flex flex-col gap-1.5">
                    <TermLine dim delay={0}>battle started</TermLine>
                    <TermLine delay={0.08} prefix="$">
                      <span className="text-[#888]">predict </span>
                      <span className="text-white">&quot;{question}&quot;</span>
                    </TermLine>
                    <TermLine dim delay={0.16}>
                      {`analyst · skeptic · historian${extraModels.length > 0 ? ` · ${extraModels.map(id => availableModels.find(m => m.id === id)?.name ?? id).join(" · ").toLowerCase()}` : ""} — debating now`}
                    </TermLine>
                  </div>

                  <div className="h-px bg-[#111]" />

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <AgentPlan isComplete={false} />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.4 }}
                    className="flex items-center gap-2 text-[#666] text-xs"
                  >
                    <span>elapsed: {elapsed}s</span>
                    <span>·</span>
                    <span>0G Testnet</span>
                    <Cursor />
                  </motion.div>
                </motion.div>
              )}

              {/* DONE */}
              {phase === "done" && result && (
                <motion.div
                  key="done"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col gap-5"
                >
                  <div className="flex flex-col gap-1">
                    <TermLine dim>prediction complete</TermLine>
                    <TermLine prefix="$" delay={0.05}>
                      <span className="text-[#888]">predict </span>
                      <span className="text-white">&quot;{result.verdict.question}&quot;</span>
                    </TermLine>
                  </div>

                  <div className="h-px bg-[#111]" />

                  {/* Verdict block */}
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.12 }}
                    className="border border-[#1a1a1a] rounded-xl bg-[#0d0d0d] p-5 flex items-center justify-between gap-4"
                  >
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[#666] text-xs">// verdict</span>
                      {result.verdict.pick && !["YES", "NO", "UNCERTAIN"].includes(result.verdict.pick) ? (
                        <>
                          <span className="text-4xl font-black tracking-tight text-white leading-none">
                            {result.verdict.pick}
                          </span>
                          <span className={`text-xs font-mono tracking-widest uppercase ${cColor}`}>
                            {cLabel}
                          </span>
                        </>
                      ) : (
                        <span className={`text-4xl font-black tracking-tight ${cColor}`}>
                          {cLabel}
                        </span>
                      )}
                      <p className="text-[#888] text-xs leading-relaxed max-w-xs mt-1">
                        {result.verdict.summary}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[#666] text-xs">// confidence</span>
                      <p className="text-4xl font-black tabular-nums">
                        <NumberTicker value={result.verdict.confidenceScore} />
                        <span className="text-xl text-[#666]">%</span>
                      </p>
                    </div>
                  </motion.div>

                  {/* Agent breakdown */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.22 }}
                    className="flex flex-col gap-2"
                  >
                    <span className="text-[#666] text-xs">// agent breakdown</span>
                    {result.verdict.agents.map((agent, i) => (
                      <motion.div
                        key={agent.agentId}
                        initial={{ opacity: 0, x: -4 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.28 + i * 0.1 }}
                        className="border border-[#111] rounded-lg p-3 bg-[#080808]"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[#666]">{">"}</span>
                            <span className="text-[#bbb] text-xs font-bold">{agent.name}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`text-xs font-bold ${leanColor(agent.lean)}`}>
                              {agent.lean}
                            </span>
                            <span className="text-[#666] text-xs">
                              {agent.confidence}%
                            </span>
                          </div>
                        </div>
                        <p className="text-[#888] text-xs leading-relaxed pl-4">
                          {agent.reasoning}
                        </p>
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* On-chain proof */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.52 }}
                    className="border border-[#111] rounded-lg p-3 flex items-center justify-between gap-3"
                  >
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="text-[#666] text-xs">stored on 0G network</span>
                      <span className="text-[#555] text-xs truncate">
                        {result.rootHash}
                      </span>
                    </div>
                    <a
                      href={result.storageScanUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 p-1.5 border border-[#1a1a1a] rounded text-[#666] hover:text-[#aaa] hover:border-[#333] transition-colors"
                    >
                      <ExternalLink size={12} />
                    </a>
                  </motion.div>

                  {/* Actions */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.62 }}
                    className="flex gap-2"
                  >
                    <button
                      onClick={copyLink}
                      className="flex items-center gap-1.5 px-3 py-2 border border-[#1a1a1a] rounded-lg text-xs text-[#888] hover:border-[#333] hover:text-white transition-colors"
                    >
                      {copied ? (
                        <Check size={12} className="text-white" />
                      ) : (
                        <Copy size={12} />
                      )}
                      {copied ? "copied" : "copy link"}
                    </button>

                    <Link
                      href={result.shareUrl}
                      className="flex items-center gap-1.5 px-3 py-2 border border-[#1a1a1a] rounded-lg text-xs text-[#888] hover:border-[#333] hover:text-white transition-colors"
                    >
                      <ArrowUpRight size={12} />
                      view receipt
                    </Link>

                    <button
                      onClick={reset}
                      className="flex-1 px-3 py-2 bg-white text-black text-xs font-bold rounded-lg hover:bg-[#e0e0e0] transition-colors"
                    >
                      new prediction →
                    </button>
                  </motion.div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#111] px-6 py-4 flex items-center justify-between">
        <span className="text-[#555] text-xs">
          verdicts are permanent. receipts don&apos;t lie.
        </span>
        <span className="text-[#444] text-xs">0G Testnet</span>
      </footer>
    </div>
  );
}
