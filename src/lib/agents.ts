import Anthropic from "@anthropic-ai/sdk";
import { getClientForModel, getDefaultModelIds, getModelById } from "./models";

const PERSONAS = [
  {
    id: "analyst",
    label: "The Analyst",
    slant: "You lean YES when evidence supports it. Cite concrete data: stats, rankings, recent form, head-to-head records.",
  },
  {
    id: "skeptic",
    label: "The Skeptic",
    slant: "You default to NO or the underdog. Find the flaw in the favourite's case. Cite upsets, injuries, or structural reasons the obvious pick fails.",
  },
  {
    id: "historian",
    label: "The Historian",
    slant: "You reason from historical precedent. Name a specific comparable past event or pattern and anchor your verdict to it.",
  },
];

export interface AgentResult {
  agentId: string;
  name: string;
  reasoning: string;
  lean: "YES" | "NO" | "UNCERTAIN";
  confidence: number;
}

export interface Verdict {
  question: string;
  agents: AgentResult[];
  consensus: "YES" | "NO" | "UNCERTAIN";
  confidenceScore: number;
  summary: string;
  pick?: string;
  timestamp: string;
}

function buildDebatePrompt(modelName: string, slant?: string): string {
  const perspective = slant ? `\nYour angle: ${slant}` : "";
  return `You are ${modelName}, debating a prediction against other AI models.${perspective}

STRICT RULES:
1. Pick YES or a specific team/outcome. "UNCERTAIN" only if genuinely 50/50.
2. Cite ONE specific fact: a team name, a stat, a player, a recent result, a tournament record. No vague statements.
3. Do NOT say "it depends", "many factors", or explain what the event is. Just predict and defend it.
4. If confidence > 55%, lean MUST be YES or NO — never UNCERTAIN.
5. reasoning must be 1-2 punchy sentences. Specific. Opinionated.

Good: {"reasoning": "Argentina are the reigning World Cup and Copa América holders — Messi-era teams historically peak across two tournaments, and their squad depth in 2026 is stronger than 2022.", "lean": "YES", "confidence": 74}
Bad: {"reasoning": "The World Cup is decided by which team scores the most goals.", "lean": "UNCERTAIN", "confidence": 50}

Respond ONLY with JSON:
{"reasoning": "...", "lean": "YES"|"NO"|"UNCERTAIN", "confidence": 0-100}`;
}

async function withRetry<T>(fn: () => Promise<T>, attempts = 3, delayMs = 2000): Promise<T> {
  let last: unknown;
  for (let i = 0; i < attempts; i++) {
    try { return await fn(); } catch (e) {
      last = e;
      if (i < attempts - 1) await new Promise(r => setTimeout(r, delayMs * (i + 1)));
    }
  }
  throw last;
}

async function callModel(
  modelId: string,
  systemPrompt: string,
  userMessage: string,
  maxTokens: number
): Promise<string> {
  const client = getClientForModel(modelId);

  if (client.type === "anthropic") {
    const res = await (client.client as Anthropic).messages.create({
      model: client.model,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    });
    const block = res.content[0];
    return block.type === "text" ? block.text : "{}";
  }

  const res = await client.client.chat.completions.create({
    model: client.model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
    temperature: 0.7,
    max_tokens: maxTokens,
  });
  return res.choices[0].message.content || "{}";
}

function parseJson<T>(text: string): T {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    return {} as T;
  }
}

async function runModelAgent(
  question: string,
  modelId: string,
  persona?: { id: string; label: string; slant: string }
): Promise<AgentResult> {
  const config = getModelById(modelId);
  const modelName = config?.name ?? modelId;
  const displayName = persona ? `${persona.label} (${modelName})` : modelName;

  const text = await withRetry(() =>
    callModel(modelId, buildDebatePrompt(displayName, persona?.slant), question, 500)
  );

  const parsed = parseJson<{ reasoning?: string; lean?: string; confidence?: number }>(text);

  return {
    agentId: persona ? `${modelId}-${persona.id}` : modelId,
    name: displayName,
    reasoning: parsed.reasoning || "Analysis not available.",
    lean: (["YES", "NO", "UNCERTAIN"].includes(parsed.lean || "") ? parsed.lean : "UNCERTAIN") as AgentResult["lean"],
    confidence: Math.min(100, Math.max(0, parsed.confidence || 50)),
  };
}

async function synthesize(
  question: string,
  agentResults: AgentResult[],
  primaryModelId: string
): Promise<{ consensus: "YES" | "NO" | "UNCERTAIN"; confidenceScore: number; summary: string; pick?: string }> {
  const debateLog = agentResults
    .map((a) => `${a.name} → ${a.lean} (${a.confidence}% confident): ${a.reasoning}`)
    .join("\n\n");

  const systemPrompt = `You are a master debate judge synthesizing verdicts from multiple AI models.

RULES:
- If 2+ models agree on YES or NO, match that verdict.
- UNCERTAIN only when there is a genuine 1-way split with weak confidence from all models.
- summary must be punchy and specific — one sentence, max 20 words. No hedging.
- confidenceScore must reflect real conviction — avoid 50 unless truly split.
- pick is the specific predicted outcome: a team name, country, company, person, value, or asset. For binary YES/NO questions where no specific entity is involved, pick is "YES" or "NO". Max 3 words.

Respond ONLY with JSON:
{"consensus": "YES"|"NO"|"UNCERTAIN", "confidenceScore": 0-100, "summary": "...", "pick": "..."}`;

  const userMessage = `Question: ${question}\n\nAI debate:\n${debateLog}`;

  let text: string;
  try {
    text = await callModel(primaryModelId, systemPrompt, userMessage, 200);
  } catch {
    // fallback to first available model
    const fallback = getDefaultModelIds()[0];
    text = await callModel(fallback, systemPrompt, userMessage, 200);
  }

  const parsed = parseJson<{ consensus?: string; confidenceScore?: number; summary?: string; pick?: string }>(text);

  return {
    consensus: (["YES", "NO", "UNCERTAIN"].includes(parsed.consensus || "") ? parsed.consensus : "UNCERTAIN") as "YES" | "NO" | "UNCERTAIN",
    confidenceScore: Math.min(100, Math.max(0, parsed.confidenceScore || 50)),
    summary: parsed.summary || "The models could not reach a clear verdict.",
    pick: parsed.pick || undefined,
  };
}

export async function runAllAgents(question: string, extraModelIds?: string[]): Promise<Verdict> {
  const zgModelId = "0g-native";

  if (!getDefaultModelIds().includes(zgModelId)) {
    throw new Error("ZG_API_KEY not set — 0G Native agents are required.");
  }

  // Always: 3 persona agents on 0G Native in parallel
  const coreAgents = PERSONAS.map((persona) => runModelAgent(question, zgModelId, persona));

  // Optional: extra AI models join the debate
  const extras = (extraModelIds ?? []).map((id) => runModelAgent(question, id));

  const agentResults = await Promise.all([...coreAgents, ...extras]);

  const { consensus, confidenceScore, summary, pick } = await synthesize(question, agentResults, zgModelId);

  return {
    question,
    agents: agentResults,
    consensus,
    confidenceScore,
    summary,
    pick,
    timestamp: new Date().toISOString(),
  };
}
