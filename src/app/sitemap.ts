import type { MetadataRoute } from "next";

const BASE_URL = "https://thegridcn.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    // English (default, no prefix)
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/timeline`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    // French (localized pathnames)
    {
      url: `${BASE_URL}/fr`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/fr/chronologie`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];
}
