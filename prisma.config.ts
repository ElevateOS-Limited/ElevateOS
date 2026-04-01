import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // Prisma CLI v7 loads this config for every command. Keep generate unblocked
    // when DATABASE_URL is absent by reading the env directly instead of env().
    url: process.env.DATABASE_URL ?? "",
  },
});
