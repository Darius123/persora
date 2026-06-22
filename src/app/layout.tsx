import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL ?? "https://persora.xyz"),
  title: "Persora. — AI predictions with receipts",
  description: "Ask anything. Three AI agents research in parallel, verdict stored permanently on 0G.",
  keywords: ["AI predictions", "0G", "on-chain", "multi-agent", "prediction market"],
  openGraph: {
    title: "Persora. — AI predictions with receipts",
    description: "Ask anything. Three AI agents research in parallel, verdict stored permanently on 0G.",
    images: ["/logo-lockup.png"],
    siteName: "Persora.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Persora. — AI predictions with receipts",
    description: "Ask anything. Three AI agents research in parallel, verdict stored permanently on 0G.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-black text-white"><Providers>{children}</Providers></body>
    </html>
  );
}
