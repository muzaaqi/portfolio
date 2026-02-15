import { MetadataRoute } from "next";
import { getProfile } from "@/db/queries";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const profile = await getProfile();

  const name = profile?.name ?? "Muhammad Zaki As Shidiqi";
  const title = profile?.title ?? "Fullstack Developer";
  const bio =
    profile?.shortBio ??
    `Portfolio of ${name} – ${title} specializing in React, Next.js, and TypeScript.`;

  return {
    name: `${name} – ${title}`,
    short_name: "Muzaaqi",
    description: bio,
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
