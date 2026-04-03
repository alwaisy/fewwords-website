import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import bcrypt from "bcryptjs";
import { users, subscriptions } from "./schema";

const databaseUrl = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/fewwords";

const client = postgres(databaseUrl);
const db = drizzle(client, { schema: { users, subscriptions } });

async function main() {
  console.log("Seeding database...");

  // Hash password
  const hashedPassword = await bcrypt.hash("password123", 10);

  // Create admin user
  const [admin] = await db
    .insert(users)
    .values({
      email: "admin@fewwords.dev",
      password: hashedPassword,
      firstName: "Admin",
      lastName: "User",
      role: "ADMIN",
    })
    .onConflictDoNothing()
    .returning();

  if (admin) {
    console.log("Created admin user:", admin.email);

    // Create subscription for admin
    await db
      .insert(subscriptions)
      .values({
        userId: admin.id,
        tier: "ENTERPRISE",
        status: "active",
        quotaMonthly: 1000,
        quotaUsed: 0,
      })
      .onConflictDoNothing();
  }

  // Create demo user
  const [demo] = await db
    .insert(users)
    .values({
      email: "demo@fewwords.dev",
      password: hashedPassword,
      firstName: "Demo",
      lastName: "User",
      role: "USER",
    })
    .onConflictDoNothing()
    .returning();

  if (demo) {
    console.log("Created demo user:", demo.email);

    // Create subscription for demo user
    await db
      .insert(subscriptions)
      .values({
        userId: demo.id,
        tier: "FREE",
        status: "active",
        quotaMonthly: 10,
        quotaUsed: 0,
      })
      .onConflictDoNothing();
  }

  console.log("Seeding completed!");
  console.log("Demo credentials:");
  console.log("  Email: demo@fewwords.dev");
  console.log("  Password: password123");
  console.log("Admin credentials:");
  console.log("  Email: admin@fewwords.dev");
  console.log("  Password: password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    client.end();
  });
