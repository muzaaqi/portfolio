import type { Metadata } from "next";
import Script from "next/script";
import { JetBrains_Mono, Libre_Baskerville } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import { ThemeProvider } from "next-themes";

const libreBaskervilleSans = Libre_Baskerville({
  weight: "400",
  variable: "--font-libre-baskerville",
  subsets: ["latin"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://muzaaqi.my.id"),

  title: "Muhammad Zaki As Shidqi",
  description: "Portfolio of Muhammad Zaki As Shidqi – Frontend Developer.",
  keywords: [
    "Muhammad Zaki As Shidqi",
    "Muzaaqi",
    "MUZAAQI",
    "Zaki",
    "As Shidqi",
    "Frontend Developer",
    "Portfolio",
    "Web Developer",
    "React",
    "Next.js",
    "JavaScript",
    "TypeScript",
    "CSS",
    "HTML",
    "Digital Creator",
    "Gamer",
    "Programmer",
    "Coding",
    "Web Design",
    "UI/UX",
    "Open Source",
    "Projects",
    "Tech Enthusiast",
    "Software Engineer",
    "Youtuber",
  ],

  alternates: {
    canonical: "https://www.muzaaqi.my.id",
  },

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
    url: "https://muzaaqi.my.id",
    siteName: "Muhammad Zaki As Shidqi",
    title: "Muhammad Zaki As Shidqi",
    description: "Portfolio of Muhammad Zaki As Shidqi – Frontend Developer.",
    images: [
      {
        url: "/og-image.webp",
        width: 1200,
        height: 630,
        alt: "Portfolio Preview",
      },
    ],
    locale: "id_ID",
  },

  twitter: {
    card: "summary_large_image",
    title: "Muhammad Zaki As Shidqi",
    description: "Portfolio of Muhammad Zaki As Shidqi – Frontend Developer.",
    images: ["/og-image.webp"],
  },

  other: {
    "og:title": "Muhammad Zaki As Shidqi",
    "og:description":
      "Portfolio of Muhammad Zaki As Shidqi – Frontend Developer.",
    "og:image": "https://muzaaqi.my.id/og-image.webp",
    "og:image:width": "1200",
    "og:image:height": "630",
    "og:image:type": "image/png",
    "og:url": "https://muzaaqi.my.id",
    "og:type": "website",

    "og:image:secure_url": "https://muzaaqi.my.id/og-image.webp",

    "twitter:image": "https://muzaaqi.my.id/og-image.webp",
  },

  icons: {
    icon: [
      {
        url: "/favicon-light.ico",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/favicon-dark.ico",
        media: "(prefers-color-scheme: dark)",
      },
    ],
    shortcut: ["/favicon-light.ico"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${libreBaskervilleSans.variable} ${jetBrainsMono.variable} antialiased`}
      >
        <Script
          id="person-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              name: "Muhammad Zaki As Shidqi",
              url: "https://muzaaqi.my.id",
              sameAs: [
                "https://instagram.com/muzaaqi_",
                "https://github.com/muzaaqi",
                "https://www.linkedin.com/in/muzaaqi/",
                "https://www.youtube.com/@muzaaqi",
              ],
            }),
          }}
        />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXX"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XXXXXXX');
          `}
        </Script>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          <main className="bg-background flex min-h-screen items-center justify-center font-sans">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
