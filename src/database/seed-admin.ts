import { db } from "./connection";
import { roles } from "./schema/roles";
import { permissions } from "./schema/permissions";
import { rolePermissions } from "./schema/rolePermissions";
import { users } from "./schema/users";
import { userRoles } from "./schema/userRoles";
import { password } from "bun";

async function main() {
    console.log("Seeding RBAC...");

    // 1. Create Roles
    console.log("Creating roles...");
    const [adminRole] = await db.insert(roles).values({ name: "Administrator", slug: "admin" }).onConflictDoNothing().returning();
    const [staffRole] = await db.insert(roles).values({ name: "Staff", slug: "staff" }).onConflictDoNothing().returning();

    // 2. Create Permissions
    console.log("Creating permissions...");
    const perms = await db.insert(permissions).values([
        { name: "View Users", slug: "user.view" },
        { name: "Create User", slug: "user.create" },
        { name: "Update User", slug: "user.update" },
        { name: "Delete User", slug: "user.delete" },
    ]).onConflictDoNothing().returning();

    // 3. Link Admin Role to all Permissions
    if (adminRole && perms.length > 0) {
        console.log("Linking permissions to admin role...");
        await db.insert(rolePermissions).values(
            perms.map(p => ({ roleId: adminRole.id, permissionId: p.id }))
        ).onConflictDoNothing();
    }

    // 4. Create SuperAdmin User
    console.log("Creating superadmin user...");
    const hashedPassword = await password.hash("admin123");
    const [adminUser] = await db.insert(users).values({
        name: "Super Admin",
        email: "admin@linkin.id",
        password: hashedPassword,
        role: "owner", // Legacy direct role
    }).onConflictDoNothing().returning();

    // 5. Assign Admin Role to User
    if (adminUser && adminRole) {
        console.log("Assigning admin role to user...");
        await db.insert(userRoles).values({
            userId: adminUser.id,
            roleId: adminRole.id,
        }).onConflictDoNothing();
    }

    console.log("Seeding complete!");
    process.exit(0);
}

main().catch((err) => {
    console.error("Seeding failed:", err);
    process.exit(1);
});
