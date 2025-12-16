import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "TuitionPay - Save 10-12% on Private School Tuition",
    template: "%s | TuitionPay",
  },
  description:
    "Discover which credit cards will maximize your rewards when paying private school tuition. Save 10-12% through optimized signup bonuses and rewards.",
  keywords: [
    "tuition payment",
    "private school",
    "credit card rewards",
    "tuition savings",
    "school payment",
  ],
  authors: [{ name: "TuitionPay" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "TuitionPay",
    title: "TuitionPay - Save 10-12% on Private School Tuition",
    description:
      "Discover which credit cards will maximize your rewards when paying private school tuition.",
  },
  twitter: {
    card: "summary_large_image",
    title: "TuitionPay - Save 10-12% on Private School Tuition",
    description:
      "Discover which credit cards will maximize your rewards when paying private school tuition.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased min-h-screen flex flex-col`}>
        {children}
      </body>
    </html>
  );
}
