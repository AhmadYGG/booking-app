import { db } from "../connection";
import { roles } from "../schema/roles";
import { permissions } from "../schema/permissions";
import { rolePermissions } from "../schema/rolePermissions";

export default async function seed() {
    console.log("Seeding Roles & Permissions...");

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
        { name: "View Roles", slug: "role.view" },
        { name: "Create Role", slug: "role.create" },
        { name: "Update Role", slug: "role.update" },
        { name: "Delete Role", slug: "role.delete" },
    ]).onConflictDoNothing().returning();

    // 3. Link Admin Role to all Permissions
    if (adminRole && perms.length > 0) {
        console.log("Linking permissions to admin role...");
        await db.insert(rolePermissions).values(
            perms.map(p => ({ roleId: adminRole.id, permissionId: p.id }))
        ).onConflictDoNothing();
    }

    console.log("Roles & Permissions seeded!");
}
