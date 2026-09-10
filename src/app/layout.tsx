import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FarmFuse | From fragmented farms to unified markets",
  description: "AI-assisted aggregation and coordination for smallholder farmers and bulk buyers.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
