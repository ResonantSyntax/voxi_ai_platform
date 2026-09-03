import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Voxi",
  description: "What Voxi did while you weren't there.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-surface-canvas text-text-primary font-sans">{children}</body>
    </html>
  );
}
