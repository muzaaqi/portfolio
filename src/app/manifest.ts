import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Muhammad Zaki As Shidiqi – Portfolio",
    short_name: "Muzaaqi",
    description:
      "Portfolio of Muhammad Zaki As Shidiqi – Frontend Developer specializing in React, Next.js, and TypeScript.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    icons: [
      {
        src: "/favicon-light.ico",
        sizes: "any",
        type: "image/x-icon",
      },
      {
        src: "/favicon-dark.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
