import { MetadataRoute } from "next";
import { getProfile } from "@/db/queries";

const BASE_URL = "https://www.muzaaqi.my.id";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const profile = await getProfile();

  return [
    {
      url: BASE_URL,
      lastModified: profile?.updatedAt
        ? new Date(profile.updatedAt).toISOString()
        : new Date().toISOString(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
