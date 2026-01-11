import { db } from "../connection";
import { services } from "../schema/services";

export default async function seed() {
    console.log("Seeding Services...");

    await db.insert(services).values([
        { serviceName: "Haircut", durationMinutes: 30, price: "50000", description: "Standard haircut" },
        { serviceName: "Massage", durationMinutes: 60, price: "150000", description: "Full body massage" },
        { serviceName: "Nail Care", durationMinutes: 45, price: "75000", description: "Manicure and pedicure" },
    ]).onConflictDoNothing();

    console.log("Services seeded!");
}
