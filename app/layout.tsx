import type { Metadata, Viewport } from "next";
import { IdentityProvider } from "@/components/IdentityProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agenda Kycn",
  description: "Agenda compartida del equipo de consultores Kycn",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Agenda Kycn",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0F2540",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 font-sans">
        <IdentityProvider>{children}</IdentityProvider>
      </body>
    </html>
  );
}
