import { ImageResponse } from "next/og";
import { getProfile } from "@/db/queries";

export const runtime = "edge";

const BASE_URL = "https://www.muzaaqi.my.id";

export async function GET() {
  const profile = await getProfile();

  const name = profile?.name ?? "Muhammad Zaki As Shidiqi";
  const title = profile?.title ?? "Fullstack Developer";
  const bio =
    profile?.shortBio ??
    "Crafting digital experiences with code and creativity.";
  const profileImageUrl = profile?.profileImageUrl
    ? profile.profileImageUrl.startsWith("http")
      ? profile.profileImageUrl
      : `${BASE_URL}${profile.profileImageUrl.startsWith("/") ? "" : "/"}${profile.profileImageUrl}`
    : `${BASE_URL}/profile.webp`;

  // Fetch Inter font (bold weight for headings)
  let interBold: ArrayBuffer | undefined;
  let interRegular: ArrayBuffer | undefined;
  try {
    const [boldCss, regularCss] = await Promise.all([
      fetch(
        "https://fonts.googleapis.com/css2?family=Inter:wght@700&display=swap",
      ).then((r) => r.text()),
      fetch(
        "https://fonts.googleapis.com/css2?family=Inter:wght@400&display=swap",
      ).then((r) => r.text()),
    ]);
    const boldUrl = boldCss.match(/src: url\((.+?)\) format\('woff2'\)/)?.[1];
    const regularUrl = regularCss.match(
      /src: url\((.+?)\) format\('woff2'\)/,
    )?.[1];
    if (boldUrl) interBold = await fetch(boldUrl).then((r) => r.arrayBuffer());
    if (regularUrl)
      interRegular = await fetch(regularUrl).then((r) => r.arrayBuffer());
  } catch {
    // Font fetch failed — fallback to system sans-serif
  }

  // Dark theme colors (from globals.css .dark)
  const bg = "#38352E"; // --background dark
  const cardBg = "#423F37"; // --card dark
  const foreground = "#E2D8C4"; // --foreground dark
  const mutedFg = "#B0A58E"; // --muted-foreground dark
  const border = "#5A5547"; // --border dark
  const primary = "#F5EDD6"; // --primary dark (cream)

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          backgroundColor: bg,
          fontFamily: "Inter, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Left content area */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "56px 60px",
            width: "720px",
            height: "100%",
          }}
        >
          {/* Top: Name + Title */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            <div
              style={{
                fontSize: "56px",
                fontWeight: 700,
                color: primary,
                lineHeight: 1.05,
                letterSpacing: "-0.03em",
                display: "flex",
              }}
            >
              {name}
            </div>
            <div
              style={{
                fontSize: "24px",
                fontWeight: 400,
                color: mutedFg,
                letterSpacing: "-0.01em",
                display: "flex",
              }}
            >
              {title}
            </div>
          </div>

          {/* Middle: Bio */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            {/* Divider — hard edge, neo-brutalist style */}
            <div
              style={{
                width: "48px",
                height: "4px",
                backgroundColor: primary,
                display: "flex",
              }}
            />
            <div
              style={{
                fontSize: "18px",
                fontWeight: 400,
                color: mutedFg,
                lineHeight: 1.6,
                maxWidth: "560px",
                display: "flex",
              }}
            >
              {bio.length > 140 ? bio.slice(0, 140) + "…" : bio}
            </div>
          </div>

          {/* Bottom: Domain */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                backgroundColor: primary,
                display: "flex",
              }}
            />
            <div
              style={{
                fontSize: "15px",
                fontWeight: 400,
                color: border,
                letterSpacing: "0.02em",
                display: "flex",
              }}
            >
              www.muzaaqi.my.id
            </div>
          </div>
        </div>

        {/* Right: Profile image area */}
        <div
          style={{
            display: "flex",
            width: "480px",
            height: "100%",
            position: "relative",
            alignItems: "flex-end",
            justifyContent: "center",
          }}
        >
          {/* Card background behind image */}
          <div
            style={{
              position: "absolute",
              top: "40px",
              right: "40px",
              bottom: "0",
              left: "20px",
              backgroundColor: cardBg,
              border: `2px solid ${border}`,
              display: "flex",
            }}
          />
          {/* Profile image */}
          <img
            src={profileImageUrl}
            alt=""
            width={360}
            height={520}
            style={{
              objectFit: "cover",
              objectPosition: "top center",
              zIndex: 1,
              height: "520px",
              width: "360px",
            }}
          />
          {/* Gradient overlay at bottom of image */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: "20px",
              right: "40px",
              height: "120px",
              background: `linear-gradient(to top, ${bg}, transparent)`,
              zIndex: 2,
              display: "flex",
            }}
          />
        </div>

        {/* Top border accent — hard line, no gradient */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            backgroundColor: primary,
            display: "flex",
          }}
        />
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        ...(interBold
          ? [
              {
                name: "Inter" as const,
                data: interBold,
                style: "normal" as const,
                weight: 700 as const,
              },
            ]
          : []),
        ...(interRegular
          ? [
              {
                name: "Inter" as const,
                data: interRegular,
                style: "normal" as const,
                weight: 400 as const,
              },
            ]
          : []),
      ],
      headers: {
        "Cache-Control": "public, max-age=86400, s-maxage=604800",
      },
    },
  );
}
