import type { Metadata } from "next";
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
  title: "Muhammad Zaki As Shidqi - Portfolio",
  description: "MUZAAQ's Portfolio",
  icons: {
    other: [
      {
        rel: "icon",
        url: "/favicon-light.ico",
        media: "(prefers-color-scheme: light)",
      },
      {
        rel: "icon",
        url: "/favicon-dark.ico",
        media: "(prefers-color-scheme: dark)",
      },
    ],
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
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
        <Navbar />
        <div className="bg-background flex min-h-screen items-center justify-center font-sans">
        {children}
        </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
