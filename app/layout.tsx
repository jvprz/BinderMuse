import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import AppFooter from "@/components/layout/AppFooter";
import AppHeader from "@/components/layout/AppHeader";
import { I18nProvider } from "@/i18n/I18nProvider";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BinderMuse",
  description: "Design beautiful binder pages for your card collection.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body>
        <I18nProvider>
          <div className="flex min-h-screen flex-col">
            <AppHeader />

            <div className="flex-1">{children}</div>

            <AppFooter />
          </div>
        </I18nProvider>
      </body>
    </html>
  );
}