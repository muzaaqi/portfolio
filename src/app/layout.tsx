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

  title: {
    default: "Muhammad Zaki As Shidiqi",
    template: "%s | Muhammad Zaki As Shidiqi",
  },
  description:
    "Portfolio of Muhammad Zaki As Shidiqi – Fullstack Developer specializing in React, Next.js, and TypeScript. View projects, skills, and experience.",
  keywords: [
    "Muhammad Zaki As Shidiqi",
    "Muzaaqi",
    "MUZAAQI",
    "Zaki",
    "As Shidiqi",
    "Fullstack Developer",
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
  authors: [{ name: "Muhammad Zaki As Shidiqi", url: "https://muzaaqi.my.id" }],
  creator: "Muhammad Zaki As Shidiqi",
  publisher: "Muhammad Zaki As Shidiqi",
  category: "technology",

  alternates: {
    canonical: "https://muzaaqi.my.id",
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
    title: "Muhammad Zaki As Shidiqi – Fullstack Developer Portfolio",
    description:
      "Portfolio of Muhammad Zaki As Shidiqi – Fullstack Developer specializing in React, Next.js, and TypeScript.",
    images: [
      {
        url: "/og-image.webp",
        width: 1200,
        height: 630,
        alt: "Muhammad Zaki As Shidiqi – Portfolio Preview",
        type: "image/webp",
      },
    ],
    locale: "id_ID",
  },

  twitter: {
    card: "summary_large_image",
    title: "Muhammad Zaki As Shidiqi – Fullstack Developer Portfolio",
    description:
      "Portfolio of Muhammad Zaki As Shidiqi – Fullstack Developer specializing in React, Next.js, and TypeScript.",
    images: [
      {
        url: "/og-image.webp",
        width: 1200,
        height: 630,
        alt: "Muhammad Zaki As Shidiqi – Portfolio Preview",
      },
    ],
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
              alternateName: "Muzaaqi",
              url: "https://muzaaqi.my.id",
              image: "https://muzaaqi.my.id/profile.webp",
              jobTitle: "Fullstack Developer",
              description:
                "Fullstack Developer specializing in React, Next.js, and TypeScript.",
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
          id="website-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Muhammad Zaki As Shidiqi Portfolio",
              url: "https://muzaaqi.my.id",
              description:
                "Portfolio of Muhammad Zaki As Shidiqi – Fullstack Developer specializing in React, Next.js, and TypeScript.",
              author: {
                "@type": "Person",
                name: "Muhammad Zaki As Shidiqi",
              },
            }),
          }}
        />
        <Script
          id="profile-page-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ProfilePage",
              mainEntity: {
                "@type": "Person",
                name: "Muhammad Zaki As Shidiqi",
                url: "https://muzaaqi.my.id",
              },
              dateCreated: "2024-01-01",
              dateModified: new Date().toISOString().split("T")[0],
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
