import { db } from "../connection";
import { users } from "../schema/users";
import { roles } from "../schema/roles";
import { userRoles } from "../schema/userRoles";
import { password } from "bun";

export default async function seed() {
    console.log("Seeding Users...");

    const hashedPassword = await password.hash("admin123");

    // 1. Create Super Admin
    console.log("Creating super admin user...");
    const [adminUser] = await db.insert(users).values({
        name: "Super Admin",
        email: "admin@linkin.id",
        password: hashedPassword,
        role: "owner",
    }).onConflictDoNothing().returning();

    // 2. Create Staff User
    console.log("Creating staff user...");
    const [staffUser] = await db.insert(users).values({
        name: "Staff User",
        email: "staff@linkin.id",
        password: hashedPassword,
        role: "staff",
    }).onConflictDoNothing().returning();

    // 3. Assign Roles
    const adminRole = await db.query.roles.findFirst({ where: (roles, { eq }) => eq(roles.slug, 'admin') });
    const staffRole = await db.query.roles.findFirst({ where: (roles, { eq }) => eq(roles.slug, 'staff') });

    if (adminUser && adminRole) {
        console.log("Assigning admin role to user...");
        await db.insert(userRoles).values({
            userId: adminUser.id,
            roleId: adminRole.id,
        }).onConflictDoNothing();
    }

    if (staffUser && staffRole) {
        console.log("Assigning staff role to user...");
        await db.insert(userRoles).values({
            userId: staffUser.id,
            roleId: staffRole.id,
        }).onConflictDoNothing();
    }

    console.log("Users seeded!");
}
