import { integer, pgTable, text, date, time, timestamp, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { customers } from "./customers";
import { services } from "./services";
import { payments } from "./payments";

export const bookings = pgTable("bookings", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    bookingCode: text("booking_code").notNull().unique(),
    customerId: integer("customer_id").references(() => customers.id),
    serviceId: integer("service_id").references(() => services.id),
    bookingDate: date("booking_date"),
    startTime: time("start_time"),
    endTime: time("end_time"),
    status: text("status").default('pending'),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
    customer: one(customers, {
        fields: [bookings.customerId],
        references: [customers.id],
    }),
    service: one(services, {
        fields: [bookings.serviceId],
        references: [services.id],
    }),
    payments: many(payments),
}));