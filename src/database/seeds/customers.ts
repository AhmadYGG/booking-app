import { db } from "../connection";
import { customers } from "../schema/customers";

export default async function seed() {
    console.log("Seeding Customers...");

    await db.insert(customers).values([
        { name: "John Doe", phone: "08123456789", email: "john@example.com", notes: "Regular customer" },
        { name: "Jane Smith", phone: "08987654321", email: "jane@example.com", notes: "VIP customer" },
        { name: "Alice Johnson", phone: "08555555555", email: "alice@example.com" },
    ]).onConflictDoNothing();

    console.log("Customers seeded!");
}
