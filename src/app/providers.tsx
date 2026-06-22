"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { zgTestnet } from "@/lib/0g-chain";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      config={{
        appearance: {
          theme: "dark",
          accentColor: "#ffffff",
          logo: "/logo-lockup.png",
        },
        defaultChain: zgTestnet,
        supportedChains: [zgTestnet],
        loginMethods: ["wallet", "email"],
        embeddedWallets: {
          ethereum: { createOnLogin: "users-without-wallets" },
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
