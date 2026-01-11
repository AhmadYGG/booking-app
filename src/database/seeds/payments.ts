import { db } from "../connection";
import { payments } from "../schema/payments";
import { bookings } from "../schema/bookings";

export default async function seed() {
    console.log("Seeding Payments...");

    const booking = await db.query.bookings.findFirst();

    if (!booking) {
        console.warn("Skipping Payments: Booking not found. Run booking seed first.");
        return;
    }

    await db.insert(payments).values([
        {
            bookingId: booking.id,
            paymentMethod: "cash",
            paymentType: "full",
            amount: "50000",
            paymentStatus: "paid",
            paidAt: new Date(),
        }
    ]).onConflictDoNothing();

    console.log("Payments seeded!");
}
