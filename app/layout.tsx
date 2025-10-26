import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from '@/components/providers/session-provider';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Floor Masters - Tracking System",
  description: "Professional floor mould rental tracking system for inventory management, rentals, and revenue tracking",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}

