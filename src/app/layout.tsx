import type { Metadata, Viewport } from "next";
import { Lexend } from "next/font/google";
import { Providers } from "@/components/providers";
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
  description: "Dashboard de gestion financière pour les JCM",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Finances",
  },
  other: {
    "apple-mobile-web-app-title": "JCM",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon0.svg", type: "image/svg+xml" },
      { url: "/icon1.png", type: "image/png" },
    ],
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${lexend.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
