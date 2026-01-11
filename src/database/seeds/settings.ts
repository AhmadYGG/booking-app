import { db } from "../connection";
import { settings } from "../schema/settings";

export default async function seed() {
    console.log("Seeding Settings...");

    await db.insert(settings).values({
        businessName: "Linkin Booking",
        businessPhone: "081122334455",
        businessAddress: "Jl. Raya No. 123, Jakarta",
        openTime: "09:00:00",
        closeTime: "21:00:00",
        bookingInterval: 30,
    }).onConflictDoNothing();

    console.log("Settings seeded!");
}
