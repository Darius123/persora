import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";

export interface ModelConfig {
  id: string;
  name: string;
  description: string;
  provider: "openai" | "anthropic" | "0g";
  modelId: string;
}

export const MODEL_CONFIGS: ModelConfig[] = [
  {
    id: "chatgpt",
    name: "ChatGPT",
    description: "OpenAI GPT-4o",
    provider: "openai",
    modelId: "gpt-4o",
  },
  {
    id: "claude",
    name: "Claude",
    description: "Anthropic Claude Sonnet",
    provider: "anthropic",
    modelId: "claude-sonnet-4-6",
  },
  {
    id: "0g-native",
    name: "0G Native",
    description: "Powered by 0G Compute",
    provider: "0g",
    modelId: process.env.ZG_MODEL || "qwen2.5-omni",
  },
];

export function getModelById(id: string): ModelConfig | undefined {
  return MODEL_CONFIGS.find((m) => m.id === id);
}

export function getAvailableModelIds(): string[] {
  return MODEL_CONFIGS.filter((m) => {
    if (m.provider === "openai") return !!process.env.OPENAI_API_KEY;
    if (m.provider === "anthropic") return !!process.env.ANTHROPIC_API_KEY;
    if (m.provider === "0g") return !!process.env.ZG_API_KEY;
    return false;
  }).map((m) => m.id);
}

export function getDefaultModelIds(): string[] {
  return getAvailableModelIds().slice(0, 3);
}

type InferenceClient =
  | { type: "openai"; client: OpenAI; model: string }
  | { type: "anthropic"; client: Anthropic; model: string };

const _cache = new Map<string, InferenceClient>();

export function getClientForModel(modelId: string): InferenceClient {
  if (_cache.has(modelId)) return _cache.get(modelId)!;

  const config = getModelById(modelId);
  if (!config) throw new Error(`Unknown model: ${modelId}`);

  let client: InferenceClient;

  if (config.provider === "openai") {
    const key = process.env.OPENAI_API_KEY;
    if (!key) throw new Error("OPENAI_API_KEY not set");
    client = { type: "openai", client: new OpenAI({ apiKey: key }), model: config.modelId };
  } else if (config.provider === "anthropic") {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) throw new Error("ANTHROPIC_API_KEY not set");
    client = { type: "anthropic", client: new Anthropic({ apiKey: key }), model: config.modelId };
  } else {
    const key = process.env.ZG_API_KEY;
    if (!key) throw new Error("ZG_API_KEY not set");
    client = {
      type: "openai",
      client: new OpenAI({ apiKey: key, baseURL: process.env.ZG_BASE_URL || "https://router-api.0g.ai/v1" }),
      model: config.modelId,
    };
  }

  _cache.set(modelId, client);
  return client;
}
