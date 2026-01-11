import { readdirSync } from "fs";
import { join } from "path";

const SEEDS_DIR = join(import.meta.dir, "seeds");

async function main() {
    const args = process.argv.slice(2);
    const seedName = args[0];

    const files = readdirSync(SEEDS_DIR)
        .filter(f => f.endsWith(".ts"))
        .map(f => f.replace(".ts", ""));

    if (!seedName) {
        console.log("\nAvailable seeders:");
        files.forEach(f => console.log(`- ${f}`));
        console.log("- all (runs all seeders in order)\n");
        console.log("Usage: bun run seed <seeder-name>\n");
        process.exit(0);
    }

    if (seedName === "all") {
        console.log("Running all seeders...");
        const orderedSeeds = [
            "roles",
            "users",
            "customers",
            "services",
            "schedules",
            "settings",
            "bookings",
            "payments"
        ];
        
        for (const name of orderedSeeds) {
            if (files.includes(name)) {
                await runSeeder(name);
            }
        }
        console.log("\nAll seeders completed!");
        process.exit(0);
    }

    if (files.includes(seedName)) {
        await runSeeder(seedName);
        process.exit(0);
    } else {
        console.error(`\nError: Seeder "${seedName}" not found.`);
        console.log("Available seeders:");
        files.forEach(f => console.log(`- ${f}`));
        console.log("- all\n");
        process.exit(1);
    }
}

async function runSeeder(name: string) {
    try {
        console.log(`\n--- Running Seeder: ${name} ---`);
        const module = await import(`./seeds/${name}.ts`);
        if (typeof module.default === "function") {
            await module.default();
        } else {
            console.error(`Error: Seeder "${name}" does not have a default export function.`);
        }
    } catch (err) {
        console.error(`Error running seeder "${name}":`, err);
    }
}

main().catch(err => {
    console.error("Seeding failed:", err);
    process.exit(1);
});
