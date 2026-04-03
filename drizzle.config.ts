import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./database/orm/schema.ts",
  out: "./database/orm/migrations",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
