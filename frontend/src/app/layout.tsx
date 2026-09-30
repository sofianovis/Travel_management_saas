import type { Metadata } from "next";
import { Cairo } from "next/font/google"; // الخط العربي
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
});

export const metadata: Metadata = {
  title: "منصة النزلاء - لوحة تحكم وكالة السفر",
  description: "نظام إدارة وكالات السفر والسياحة - Elnouzalaa SaaS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} h-full antialiased`}>
      <body className="min-h-full bg-background text-foreground flex flex-col font-sans">
        {children}
      </body>
    </html>
  );
}
