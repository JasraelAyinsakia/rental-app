import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from '@/components/providers/session-provider';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mould Rental Tracker",
  description: "Track mould rentals, payments, and returns",
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

