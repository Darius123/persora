import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";
import { getEstimatedBalance } from "@/lib/topup";

const ADMIN_ADDRESS = "0xc46Cc1d2BAf3955D325219fcE9DEcC52FEf55476".toLowerCase();
const RPC = process.env.NEXT_PUBLIC_CHAIN_RPC || "https://evmrpc-testnet.0g.ai";

export async function GET() {
  return Response.json({ inferenceBalance: getEstimatedBalance() });
}

export async function POST(req: NextRequest) {
  const { walletAddress, to, amount } = await req.json();

  if (walletAddress?.toLowerCase() !== ADMIN_ADDRESS) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const privateKey = process.env.TREASURY_PRIVATE_KEY;
  if (!privateKey) {
    return NextResponse.json({ error: "Treasury key not configured" }, { status: 500 });
  }

  if (!ethers.isAddress(to)) {
    return NextResponse.json({ error: "Invalid destination address" }, { status: 400 });
  }

  const parsedAmount = parseFloat(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  try {
    const provider = new ethers.JsonRpcProvider(RPC);
    const wallet = new ethers.Wallet(privateKey, provider);

    const balance = await provider.getBalance(wallet.address);
    const value = ethers.parseEther(parsedAmount.toString());

    if (value > balance) {
      return NextResponse.json({ error: "Insufficient treasury balance" }, { status: 400 });
    }

    const tx = await wallet.sendTransaction({ to, value });
    await tx.wait();

    return NextResponse.json({ txHash: tx.hash });
  } catch (err) {
    console.error("[withdraw]", err);
    return NextResponse.json({ error: "Withdrawal failed" }, { status: 500 });
  }
}
