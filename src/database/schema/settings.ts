import { integer, pgTable, text, time, timestamp } from "drizzle-orm/pg-core";

export const settings = pgTable("settings", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    businessName: text("business_name"),
    businessPhone: text("business_phone"),
    businessAddress: text("business_address"),
    openTime: time("open_time"),
    closeTime: time("close_time"),
    bookingInterval: integer("booking_interval"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});
