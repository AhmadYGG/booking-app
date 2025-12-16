import { integer, pgTable, time, boolean, timestamp } from "drizzle-orm/pg-core";

export const schedules = pgTable("schedules", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    dayOfWeek: integer("day_of_week"),
    openTime: time("open_time"),
    closeTime: time("close_time"),
    isOpen: boolean("is_open").default(true),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});
