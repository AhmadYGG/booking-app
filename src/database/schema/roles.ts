import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const roles = pgTable("roles", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: text("name").notNull().unique(),
    slug: text("slug").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});
