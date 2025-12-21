
import { Context, Hono } from "hono";
import { db } from "../../database/connection";
import { permissions } from "../../database/schema/permissions";
import { eq } from "drizzle-orm";

const permissionRoute = new Hono();

class PermissionService {
    async getAll() {
        return await db.select().from(permissions);
    }

    async getById(id: number) {
        const result = await db.select().from(permissions).where(eq(permissions.id, id)).limit(1);
        return result[0];
    }

    async create(data: { name: string; slug: string }) {
        return await db.insert(permissions).values(data).returning();
    }

    async update(id: number, data: { name: string; slug: string }) {
        return await db.update(permissions).set(data).where(eq(permissions.id, id)).returning();
    }

    async delete(id: number) {
        return await db.delete(permissions).where(eq(permissions.id, id)).returning();
    }
}

const service = new PermissionService();

permissionRoute.get("/", async (c: Context) => {
    const data = await service.getAll();
    return c.json({ data });
});

permissionRoute.get("/:id", async (c: Context) => {
    const id = parseInt(c.req.param("id"));
    const data = await service.getById(id);
    if (!data) return c.json({ message: "Permission not found" }, 404);
    return c.json({ data });
});

permissionRoute.post("/", async (c: Context) => {
    const body = await c.req.json();
    const data = await service.create(body);
    return c.json({ data, message: "Permission created" }, 201);
});

permissionRoute.put("/:id", async (c: Context) => {
    const id = parseInt(c.req.param("id"));
    const body = await c.req.json();
    const data = await service.update(id, body);
    return c.json({ data, message: "Permission updated" });
});

permissionRoute.delete("/:id", async (c: Context) => {
    const id = parseInt(c.req.param("id"));
    await service.delete(id);
    return c.json({ message: "Permission deleted" });
});

export default permissionRoute;
