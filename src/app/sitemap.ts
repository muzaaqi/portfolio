import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://muzaaqi.my.id",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1.0,
    },
    // {
    //   url: "https://muzaaqi.my.id/about",
    //   lastModified: new Date(),
    //   changeFrequency: "monthly",
    //   priority: 0.8,
    // },
    // {
    //   url: "https://muzaaqi.my.id/projects",
    //   lastModified: new Date(),
    //   changeFrequency: "monthly",
    //   priority: 0.8,
    // },
    // {
    //   url: "https://muzaaqi.my.id/contact",
    //   lastModified: new Date(),
    //   changeFrequency: "monthly",
    //   priority: 0.6,
    // },
  ];
}
