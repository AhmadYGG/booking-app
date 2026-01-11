import { db } from "../connection";
import { bookings } from "../schema/bookings";
import { customers } from "../schema/customers";
import { services } from "../schema/services";

export default async function seed() {
    console.log("Seeding Bookings...");

    const customer = await db.query.customers.findFirst();
    const service = await db.query.services.findFirst();

    if (!customer || !service) {
        console.warn("Skipping Bookings: Customer or Service not found. Run customer and service seeds first.");
        return;
    }

    await db.insert(bookings).values([
        {
            bookingCode: "BK-001",
            customerId: customer.id,
            serviceId: service.id,
            bookingDate: new Date().toISOString().split('T')[0],
            startTime: "10:00:00",
            endTime: "10:30:00",
            status: "confirmed",
            notes: "Test booking"
        }
    ]).onConflictDoNothing();

    console.log("Bookings seeded!");
}
