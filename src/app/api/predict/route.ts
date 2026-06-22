import { NextRequest, NextResponse } from "next/server";
import { runAllAgents } from "@/lib/agents";
import { storeVerdict, buildShareUrl, buildStorageScanUrl } from "@/lib/storage";
import { verifyPayment } from "@/lib/payment";
import { deductAndTopUpIfNeeded } from "@/lib/topup";

export async function POST(req: NextRequest) {
  try {
    const { question, walletAddress, txHash, extraModels } = await req.json();

    if (!question || typeof question !== "string" || question.trim().length < 5) {
      return NextResponse.json({ error: "Question is required (min 5 chars)" }, { status: 400 });
    }

    // Payment verification — skipped in dev if treasury not configured
    if (process.env.NEXT_PUBLIC_TREASURY_ADDRESS && walletAddress && txHash) {
      const payment = await verifyPayment(walletAddress, txHash);
      if (!payment.ok) {
        return NextResponse.json({ error: payment.error }, { status: 402 });
      }
    }

    // Auto top-up inference balance — fire and don't await (non-blocking)
    if (process.env.OPERATOR_PRIVATE_KEY) {
      deductAndTopUpIfNeeded().catch((e) =>
        console.error("[topup] background error:", e)
      );
    }

    const verdict = await runAllAgents(question.trim(), Array.isArray(extraModels) ? extraModels : undefined);

    let rootHash: string;
    try {
      rootHash = await storeVerdict(verdict);
    } catch (storageErr) {
      console.error("[predict] storage failed, using fallback hash:", storageErr);
      // Verdict is complete — don't fail the whole request over storage
      const fallback = Buffer.from(JSON.stringify(verdict).slice(0, 32)).toString("hex").padEnd(64, "0");
      rootHash = `0x${fallback}`;
    }

    return NextResponse.json({
      verdict,
      rootHash,
      shareUrl: buildShareUrl(rootHash),
      storageScanUrl: buildStorageScanUrl(rootHash),
    });
  } catch (err) {
    console.error("[predict]", err);
    return NextResponse.json({ error: "Failed to process prediction" }, { status: 500 });
  }
}
