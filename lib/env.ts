import { z } from "zod";

// Validated once at module load so a misconfigured deployment fails fast with
// a message naming the variable, rather than surfacing later as a 500 at login
// (which is what happened when JWT_SECRET was merely read inline).
const envSchema = z.object({
  JWT_SECRET: z
    .string({ message: "JWT_SECRET is required" })
    .min(32, "JWT_SECRET must be at least 32 characters. Generate one with: node -e \"console.log(require('crypto').randomBytes(48).toString('hex'))\""),
  DATABASE_URL: z.string({ message: "DATABASE_URL is required" }).min(1, "DATABASE_URL must not be empty"),
  DIRECT_URL: z.string({ message: "DIRECT_URL is required" }).min(1, "DIRECT_URL must not be empty"),
});

function loadEnv() {
  const parsed = envSchema.safeParse({
    JWT_SECRET: process.env.JWT_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
    DIRECT_URL: process.env.DIRECT_URL,
  });

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(
      `Invalid environment configuration:\n${details}\n\nCopy .env.example to .env and fill in the values.`
    );
  }

  return parsed.data;
}

export const env = loadEnv();
