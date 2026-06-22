import { NextResponse } from "next/server";
import { MODEL_CONFIGS, getAvailableModelIds } from "@/lib/models";

export async function GET() {
  const availableIds = getAvailableModelIds();
  const models = MODEL_CONFIGS.map((m) => ({
    id: m.id,
    name: m.name,
    description: m.description,
    available: availableIds.includes(m.id),
  }));
  return NextResponse.json({ models });
}
