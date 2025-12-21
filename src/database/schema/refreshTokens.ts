import { integer, pgTable, varchar, index, text } from "drizzle-orm/pg-core";

export const refreshTokens = pgTable(
  "refresh_tokens",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    email: varchar({ length: 100 }).notNull(),
    userAgent: text("user_agent").notNull().unique(),
    token: text("token").notNull(),
  },
  (table) => [index("useragent_idx").on(table.userAgent)],
);
