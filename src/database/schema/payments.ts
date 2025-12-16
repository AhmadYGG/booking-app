import { integer, pgTable, text, decimal, timestamp, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { bookings } from "./bookings";

export const payments = pgTable("payments", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    bookingId: integer("booking_id").references(() => bookings.id),
    paymentMethod: text("payment_method"),
    paymentType: text("payment_type"),
    amount: decimal("amount", { precision: 15, scale: 2 }),
    paymentStatus: text("payment_status").default('unpaid'),
    paidAt: timestamp("paid_at"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export const paymentsRelations = relations(payments, ({ one }) => ({
    booking: one(bookings, {
        fields: [payments.bookingId],
        references: [bookings.id],
    }),
}));