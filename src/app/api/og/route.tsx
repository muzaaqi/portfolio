import { getProfile } from "@/db/queries";
import { generateOgImage } from "@/lib/og";
import { NextResponse } from "next/server";

/**
 * GET /api/og — Generate OG image on demand.
 * Used for preview/testing. Production og:image points to the static
 * R2 file (uploaded on profile save), not this route.
 */
export async function GET() {
  const profile = await getProfile();

  const pngBuffer = await generateOgImage({
    name: profile?.name ?? "Muhammad Zaki As Shidiqi",
    title: profile?.title ?? "Fullstack Developer",
    shortBio:
      profile?.shortBio ??
      "Crafting digital experiences with code and creativity.",
    profileImageUrl: profile?.profileImageUrl,
  });

  return new NextResponse(new Uint8Array(pngBuffer), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=86400, s-maxage=604800",
    },
  });
}
