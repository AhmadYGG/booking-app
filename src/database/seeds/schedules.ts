import { db } from "../connection";
import { schedules } from "../schema/schedules";

export default async function seed() {
    console.log("Seeding Schedules...");

    const days = [1, 2, 3, 4, 5, 6, 0]; // Mon-Sun
    const values = days.map(day => ({
        dayOfWeek: day,
        openTime: "09:00:00",
        closeTime: "21:00:00",
        isOpen: day !== 0, // Closed on Sunday for example
    }));

    await db.insert(schedules).values(values).onConflictDoNothing();

    console.log("Schedules seeded!");
}
