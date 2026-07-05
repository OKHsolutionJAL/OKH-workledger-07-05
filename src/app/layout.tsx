import type { Metadata, Viewport } from "next";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "OKH WorkLedger",
    template: "%s | OKH WorkLedger"
  },
  description: "OKH WorkLedger - Work, expenses, invoices and reports for contractors in Japan and Australia.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/favicon.svg",
    apple: "/icon.svg"
  }
};

export const viewport: Viewport = {
  themeColor: "#0f766e",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
