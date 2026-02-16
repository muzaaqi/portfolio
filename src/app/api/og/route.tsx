import { ImageResponse } from "next/og";
import { getProfile } from "@/db/queries";

export const runtime = "edge";

export async function GET() {
  const profile = await getProfile();

  const name = profile?.name ?? "Muhammad Zaki As Shidiqi";
  const title = profile?.title ?? "Fullstack Developer";
  const bio =
    profile?.shortBio ??
    "Crafting digital experiences with code and creativity.";

  // Fetch Inter font from Google Fonts
  const fontData = await fetch(
    "https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap",
  ).then((res) => res.text());

  const fontUrl = fontData.match(/src: url\((.+?)\) format\('woff2'\)/)?.[1];

  let interFont: ArrayBuffer | undefined;
  if (fontUrl) {
    interFont = await fetch(fontUrl).then((res) => res.arrayBuffer());
  }

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          backgroundColor: "#09090b",
          padding: "60px 80px",
          fontFamily: interFont ? "Inter" : "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background decoration */}
        <div
          style={{
            position: "absolute",
            top: "-120px",
            right: "-120px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-80px",
            left: "-80px",
            width: "350px",
            height: "350px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)",
            display: "flex",
          }}
        />

        {/* Top bar accent */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: "linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899)",
            display: "flex",
          }}
        />

        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            zIndex: 1,
          }}
        >
          <div
            style={{
              fontSize: "64px",
              fontWeight: 700,
              color: "#fafafa",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              display: "flex",
            }}
          >
            {name}
          </div>

          <div
            style={{
              fontSize: "28px",
              fontWeight: 400,
              color: "#a1a1aa",
              display: "flex",
            }}
          >
            {title}
          </div>

          <div
            style={{
              width: "64px",
              height: "3px",
              background: "linear-gradient(90deg, #3b82f6, #8b5cf6)",
              borderRadius: "2px",
              marginTop: "8px",
              marginBottom: "8px",
              display: "flex",
            }}
          />

          <div
            style={{
              fontSize: "20px",
              fontWeight: 400,
              color: "#71717a",
              lineHeight: 1.5,
              maxWidth: "700px",
              display: "flex",
            }}
          >
            {bio.length > 120 ? bio.slice(0, 120) + "…" : bio}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            left: "80px",
            right: "80px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              fontSize: "16px",
              color: "#52525b",
              display: "flex",
            }}
          >
            www.muzaaqi.my.id
          </div>
          <div
            style={{
              fontSize: "14px",
              color: "#3f3f46",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#3f3f46"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            Portfolio
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      ...(interFont && {
        fonts: [
          {
            name: "Inter",
            data: interFont,
            style: "normal" as const,
            weight: 400 as const,
          },
        ],
      }),
      headers: {
        "Cache-Control": "public, max-age=86400, s-maxage=604800",
      },
    },
  );
}
