import type { Metadata } from "next";
import Script from "next/script";
import { JetBrains_Mono, Inter, Anton } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { getProfile, getSocialLinks } from "@/db/queries";

const BASE_URL = "https://www.muzaaqi.my.id";

const inter = Inter({
  weight: "400",
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const anton = Anton({
  weight: "400",
  variable: "--font-anton",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getProfile();

  const name = profile?.name ?? "Muhammad Zaki As Shidiqi";
  const title = profile?.title ?? "Fullstack Developer";
  const bio =
    profile?.shortBio ??
    profile?.bio ??
    `Portfolio of ${name} – ${title} specializing in React, Next.js, and TypeScript. View projects, skills, and experience.`;

  return {
    metadataBase: new URL(BASE_URL),

    title: {
      default: `${name} – ${title} Portfolio`,
      template: `%s | ${name}`,
    },
    description: bio,
    keywords: [
      name,
      "Muzaaqi",
      "MUZAAQI",
      title,
      "Portfolio",
      "Web Developer",
      "React",
      "Next.js",
      "JavaScript",
      "TypeScript",
      "CSS",
      "HTML",
      "Digital Creator",
      "Programmer",
      "Coding",
      "Web Design",
      "UI/UX",
      "Open Source",
      "Projects",
      "Tech Enthusiast",
      "Software Engineer",
    ],
    authors: [{ name, url: BASE_URL }],
    creator: name,
    publisher: name,
    category: "technology",

    alternates: {
      canonical: "/",
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

    verification: {
      google: process.env.GOOGLE_VERIFICATION_CODE,
      // yandex: "YOUR_YANDEX_CODE",
      // other: { "msvalidate.01": "YOUR_BING_CODE" },
    },

    openGraph: {
      type: "website",
      url: BASE_URL,
      siteName: name,
      title: `${name} – ${title} Portfolio`,
      description: bio,
      images: [
        {
          url: `${process.env.R2_PUBLIC_URL}/og-image.png`,
          width: 1200,
          height: 630,
          alt: `${name} – Portfolio Preview`,
          type: "image/png",
        },
      ],
      locale: "en_US",
    },

    twitter: {
      card: "summary_large_image",
      title: `${name} – ${title} Portfolio`,
      description: bio,
      images: [
        {
          url: `${process.env.R2_PUBLIC_URL}/og-image.png`,
          width: 1200,
          height: 630,
          alt: `${name} – Portfolio Preview`,
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
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [profile, socialLinksData] = await Promise.all([
    getProfile(),
    getSocialLinks(),
  ]);

  const name = profile?.name ?? "Muhammad Zaki As Shidiqi";
  const title = profile?.title ?? "Fullstack Developer";
  const bio =
    profile?.shortBio ??
    profile?.bio ??
    `${title} specializing in React, Next.js, and TypeScript.`;
  const profileImage = profile?.profileImageUrl
    ? `${BASE_URL}${profile.profileImageUrl.startsWith("/") ? "" : "/"}${profile.profileImageUrl}`
    : `${BASE_URL}/profile.webp`;

  // Build sameAs from social links DB, falling back to hardcoded
  const sameAs =
    socialLinksData.length > 0
      ? socialLinksData.map((link) => link.url)
      : [
          "https://instagram.com/muzaaqi_",
          "https://github.com/muzaaqi",
          "https://www.linkedin.com/in/muzaaqi/",
          "https://www.youtube.com/@muzaaqi",
        ];

  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    alternateName: "Muzaaqi",
    url: BASE_URL,
    image: profileImage,
    jobTitle: title,
    description: bio,
    ...(profile?.email && { email: `mailto:${profile.email}` }),
    ...(profile?.location && {
      address: {
        "@type": "PostalAddress",
        addressLocality: profile.location,
      },
    }),
    sameAs,
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: `${name} Portfolio`,
    url: BASE_URL,
    description: `Portfolio of ${name} – ${bio}`,
    author: {
      "@type": "Person",
      name,
    },
  };

  const profilePageSchema = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: {
      "@type": "Person",
      name,
      url: BASE_URL,
    },
    dateModified: profile?.updatedAt
      ? new Date(profile.updatedAt).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="preconnect"
          href="https://www.googletagmanager.com"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-TS65PZH9');`}
        </Script>
      </head>
      <body
        className={`${inter.variable} ${jetBrainsMono.variable} ${anton.variable} antialiased`}
      >
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-TS65PZH9"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(personSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(profilePageSchema),
          }}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
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
