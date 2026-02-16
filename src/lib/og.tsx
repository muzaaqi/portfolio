import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const BASE_URL = "https://www.muzaaqi.my.id";

// Load local font files once
const interBoldPromise = readFile(
  join(process.cwd(), "src/app/api/og/Inter-Bold.ttf"),
);
const interRegularPromise = readFile(
  join(process.cwd(), "src/app/api/og/Inter-Regular.ttf"),
);

/**
 * Fetch an image and convert it to a PNG data URI.
 * Satori only supports PNG, JPEG, GIF, and SVG — not WebP.
 */
async function getImageDataUri(url: string): Promise<string | undefined> {
  try {
    const res = await fetch(url);
    if (!res.ok) return undefined;

    const contentType = res.headers.get("content-type") ?? "";
    const buffer = Buffer.from(await res.arrayBuffer());

    if (contentType.includes("webp") || url.endsWith(".webp")) {
      const pngBuffer = await sharp(buffer).png().toBuffer();
      return `data:image/png;base64,${pngBuffer.toString("base64")}`;
    }

    const mime = contentType.split(";")[0] || "image/png";
    return `data:${mime};base64,${buffer.toString("base64")}`;
  } catch {
    return undefined;
  }
}

interface OgImageData {
  name: string;
  title: string;
  shortBio: string;
  profileImageUrl?: string | null;
}

/**
 * Generate the OG image as a PNG Buffer.
 * Shared between /api/og route and the regenerateOgImage action.
 */
export async function generateOgImage(data: OgImageData): Promise<Buffer> {
  const [interBold, interRegular] = await Promise.all([
    interBoldPromise,
    interRegularPromise,
  ]);

  const name = data.name || "Muhammad Zaki As Shidiqi";
  const title = data.title || "Fullstack Developer";
  const bio =
    data.shortBio || "Crafting digital experiences with code and creativity.";

  // Resolve profile image URL
  const rawImageUrl = data.profileImageUrl
    ? data.profileImageUrl.startsWith("http")
      ? data.profileImageUrl
      : `${BASE_URL}${data.profileImageUrl.startsWith("/") ? "" : "/"}${data.profileImageUrl}`
    : null;

  const profileImageSrc = rawImageUrl
    ? await getImageDataUri(rawImageUrl)
    : undefined;

  // Dark theme colors (from globals.css .dark)
  const bg = "#38352E";
  const cardBg = "#423F37";
  const mutedFg = "#B0A58E";
  const border = "#5A5547";
  const primary = "#F5EDD6";

  const response = new ImageResponse(
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
            width: profileImageSrc ? "720px" : "100%",
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

        {/* Right: Profile image area (only if image loaded) */}
        {profileImageSrc && (
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
            <img
              src={profileImageSrc}
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
        )}

        {/* Top border accent */}
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
        {
          name: "Inter",
          data: interBold,
          style: "normal" as const,
          weight: 700 as const,
        },
        {
          name: "Inter",
          data: interRegular,
          style: "normal" as const,
          weight: 400 as const,
        },
      ],
    },
  );

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
