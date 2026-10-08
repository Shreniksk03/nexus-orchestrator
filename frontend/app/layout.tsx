import "./globals.css";
import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";

export const metadata: Metadata = {
  title: "Nexus Orchestrator | Multi-Agent Zero-Touch Compliance Analyst",
  description:
    "Enterprise vendor risk analysis platform orchestrating NVIDIA Nemotron LLMs and live Tavily web intelligence to eliminate the vendor onboarding bottleneck.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full bg-black">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="h-full bg-black text-white font-sans antialiased bg-cyber-grid">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
