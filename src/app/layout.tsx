import type { Metadata, Viewport } from "next";
import "./globals.css";

const SITE = "https://meridian.sithunyein.com";
const TITLE = "Meridian — blast-radius engine for npm and PyPI";
const DESC =
  "Paste one compromised package name. Get one English sentence and a fix command. Built on HydraDB.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: TITLE, template: "%s — Meridian" },
  description: DESC,
  applicationName: "Meridian",
  authors: [{ name: "Sithu Nyein", url: "https://meridian.sithunyein.com" }],
  other: {
    "publisher:email": "sithunyein.mailto@gmail.com",
  },
  keywords: [
    "supply chain security",
    "npm",
    "pypi",
    "transitive dependencies",
    "blast radius",
    "hydradb",
    "graph database",
  ],
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-64.png", sizes: "64x64", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: TITLE,
    description: DESC,
    url: SITE,
    siteName: "Meridian",
    images: [{ url: "/og-banner.png", width: 1200, height: 630, alt: "Meridian — blast-radius engine" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESC,
    images: ["/og-banner.png"],
  },
  alternates: { canonical: SITE },
};

export const viewport: Viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900&family=Instrument+Serif:ital@1&display=swap"
        />
      </head>
      <body className="bg-ink-950 text-ink-50 antialiased">{children}</body>
    </html>
  );
}

