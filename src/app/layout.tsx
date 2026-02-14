import type { Metadata } from "next";
import Script from "next/script";
import { JetBrains_Mono, Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  weight: "400",
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://muzaaqi.my.id"),

  title: "Muhammad Zaki As Shidiqi",
  description: "Portfolio of Muhammad Zaki As Shidiqi – Frontend Developer.",
  keywords: [
    "Muhammad Zaki As Shidiqi",
    "Muzaaqi",
    "MUZAAQI",
    "Zaki",
    "As Shidiqi",
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
    siteName: "Muhammad Zaki As Shidiqi",
    title: "Muhammad Zaki As Shidiqi",
    description: "Portfolio of Muhammad Zaki As Shidiqi – Frontend Developer.",
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
    title: "Muhammad Zaki As Shidiqi",
    description: "Portfolio of Muhammad Zaki As Shidiqi – Frontend Developer.",
    images: ["/og-image.webp"],
  },

  other: {
    "og:title": "Muhammad Zaki As Shidiqi",
    "og:description":
      "Portfolio of Muhammad Zaki As Shidiqi – Frontend Developer.",
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
        className={`${inter.variable} ${jetBrainsMono.variable} antialiased`}
      >
        <Script
          id="person-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              name: "Muhammad Zaki As Shidiqi",
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
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-DQ9JB8BVDX"
        />
        <Script id="google-analytics">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-DQ9JB8BVDX');
          `}
        </Script>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>{children}</TooltipProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
