import { NextResponse } from "next/server";
import { get0GPrice, getRequiredA0GI, PREDICTION_COST_USD } from "@/lib/payment";

export async function GET() {
  const [price, requiredA0GI] = await Promise.all([get0GPrice(), getRequiredA0GI()]);
  return NextResponse.json({
    price0G: price,
    costUSD: PREDICTION_COST_USD,
    requiredA0GI,
  });
}
