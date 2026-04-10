"use client";

import { useEffect } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { initializeAuth } from "@/lib/auth";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const monoFallback = {
  variable: "--font-geist-mono",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  useEffect(() => {
    initializeAuth();
  }, []);

  return (
    <html
      lang="id"
      className={`${inter.variable} ${monoFallback.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}

