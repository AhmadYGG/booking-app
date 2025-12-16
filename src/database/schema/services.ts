import { integer, pgTable, text, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { bookings } from "./bookings";

export const services = pgTable("services", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    serviceName: text("service_name").notNull(),
    durationMinutes: integer("duration_minutes"),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    description: text("description"),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export const servicesRelations = relations(services, ({ many }) => ({
    bookings: many(bookings),
}));
