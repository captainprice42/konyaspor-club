import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const clubName = process.env.NEXT_PUBLIC_CLUB_NAME || "Konyaspor";
const leagueName = process.env.NEXT_PUBLIC_LEAGUE_NAME || "Sanal Lig Sistemi";
const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://konyaspor.example.com";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: `${clubName} | ${leagueName} Resmi Web Sitesi`,
    template: `%s | ${clubName}`,
  },
  description: `${clubName} resmi web sitesi. Haberler, maç sonuçları, kadro bilgileri ve daha fazlası.`,
  keywords: [clubName, leagueName, "futbol", "lig", "maç", "kadro", "transfer"],
  authors: [{ name: clubName }],
  creator: clubName,
  publisher: clubName,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: appUrl,
    siteName: clubName,
    title: `${clubName} | ${leagueName}`,
    description: `${clubName} resmi web sitesi. Haberler, maç sonuçları, kadro bilgileri.`,
  },
  twitter: {
    card: "summary_large_image",
    title: `${clubName} | ${leagueName}`,
    description: `${clubName} resmi web sitesi.`,
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#1a5c2e" },
    { media: "(prefers-color-scheme: dark)", color: "#0f3d21" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
