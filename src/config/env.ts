/**
 * Centralised environment variable access.
 * Import from here instead of reading process.env directly.
 * Server-side only — never import in client components.
 */
export const env = {
  mongodb: {
    uri: process.env.MONGODB_URI ?? "",
  },
  auth: {
    discord: {
      clientId: process.env.DISCORD_CLIENT_ID ?? "",
      clientSecret: process.env.DISCORD_CLIENT_SECRET ?? "",
    },
  },
} as const;
