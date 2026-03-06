import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq } from "drizzle-orm";
import { config } from "dotenv";
import { users } from "./schema";

// Load .env file
config();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL!;
if (!ADMIN_EMAIL) {
  console.error("❌ ADMIN_EMAIL not set in .env file");
  process.exit(1);
}

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client);

async function seedAdmin() {
  console.log(`Setting admin role for ${ADMIN_EMAIL}...`);

  const result = await db
    .update(users)
    .set({ role: "admin" })
    .where(eq(users.email, ADMIN_EMAIL))
    .returning();

  if (result.length === 0) {
    console.log(`❌ No user found with email ${ADMIN_EMAIL}`);
    console.log("Please register first through /auth/register");
  } else {
    console.log(`✅ Admin role set for ${ADMIN_EMAIL}`);
  }

  await client.end();
  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
