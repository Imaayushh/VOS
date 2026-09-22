import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VOS Vision — 3D Prototype & Architecture Digital Twin",
  description: "Interactive 3D field prototype, hardware-to-software integration flow, and ₹30k BOM cost explorer for VOS Vision weighbridge monitoring.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#070a12] text-slate-100 antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
        {children}
      </body>
    </html>
  );
}
