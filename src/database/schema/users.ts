import { integer, pgTable, text, boolean, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone"),
    password: text("password"),
    role: text("role").default('staff'),
    isActive: boolean("is_active").default(true),
    lastLoginAt: timestamp("last_login_at"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});