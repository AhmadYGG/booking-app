import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { bookings } from "./bookings";

export const customers = pgTable("customers", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: text("name").notNull(),
    phone: text("phone").notNull(),
    email: text("email"),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export const customersRelations = relations(customers, ({ many }) => ({
    bookings: many(bookings),
}));
