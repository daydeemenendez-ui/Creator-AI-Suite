import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"]!,
    // directUrl used by Prisma Migrate to bypass PgBouncer pooling
    // Uncomment when you have a Supabase direct connection string:
    // directUrl: process.env["DIRECT_URL"]!,
  },
});
