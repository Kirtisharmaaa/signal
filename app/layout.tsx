import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Signal",
  description: "A product-intelligence agent for form, page, and app builders.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
