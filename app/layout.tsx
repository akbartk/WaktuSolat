import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Providers } from "./providers"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Waktu Solat - Jadwal Sholat Indonesia",
  description: "Aplikasi jadwal sholat untuk seluruh wilayah di Indonesia dengan data dari jadwalsholat.org",
  keywords: ["jadwal sholat", "waktu solat", "adzan", "indonesia", "prayer times"],
  authors: [{ name: "Waktu Solat Team" }],
  creator: "Waktu Solat Team",
  publisher: "Waktu Solat",
  formatDetection: {
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "/",
    title: "Jadwal Sholat Indonesia",
    description: "Aplikasi jadwal sholat untuk seluruh wilayah Indonesia dengan waktu yang akurat",
    siteName: "Waktu Solat",
  },
  twitter: {
    card: "summary_large_image",
    title: "Jadwal Sholat Indonesia",
    description: "Aplikasi jadwal sholat untuk seluruh wilayah Indonesia dengan waktu yang akurat",
  },
  manifest: "/manifest.json",
  icons: [
    { rel: "icon", url: "/favicon.ico" },
    { rel: "apple-touch-icon", url: "/icons/apple-icon-180.png" },
  ],
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#020817" },
  ],
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
}

interface RootLayoutProps {
  children: React.ReactNode;
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#020817" },
  ],
}

export default function RootLayout({
  children,
}: RootLayoutProps) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="format-detection" content="telephone=no" />
        <meta httpEquiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://ipapi.co https://worldtimeapi.org https://timeapi.io https://ipwho.is https://ipinfo.io https://nominatim.openstreetmap.org https://api.myquran.com https://api.banghasan.com https://api.pray.zone https://jadwalsholat.org https://*.jadwalsholat.org https://raw.githubusercontent.com;" />
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Waktu Solat" />
        <link rel="apple-touch-icon" href="/icons/apple-icon-180.png" />
      </head>
      <body className={inter.className}>
        <Providers children={children} />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('Service Worker berhasil didaftarkan dengan scope: ', registration.scope);
                    },
                    function(err) {
                      console.log('Pendaftaran Service Worker gagal: ', err);
                    }
                  );
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}

