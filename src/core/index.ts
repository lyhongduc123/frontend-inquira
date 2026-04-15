export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL!
export const C_BULLET = "•";
export const ACCESS_TOKEN_COOKIE_KEY = "access_token";
export const CITED_ONLY_STORAGE_KEY = "results_cited_only_filter";

// function requiredEnv(name: string): string {
//   const value = process.env[name]
//   if (!value) {
//     throw new Error(`Missing environment variable: ${name}`)
//   }
//   return value
// }

// requiredEnv("NEXT_PUBLIC_API_URL")