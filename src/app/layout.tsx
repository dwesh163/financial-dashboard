import type { Metadata, Viewport } from "next";
import { Lexend } from "next/font/google";
import { SessionProvider } from "@/components/providers/session";
import "./globals.css";

const lexend = Lexend({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0f0f0f",
};

export const metadata: Metadata = {
  title: "JCM - Finances",
  description: "Personal financial management",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Finances",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${lexend.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
