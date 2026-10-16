import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MoneyGuard | Business Intelligence",
  description: "Evidence-led business performance and money leak analysis.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
