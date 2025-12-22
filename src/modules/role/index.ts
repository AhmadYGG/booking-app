
import { Context, Hono } from "hono";
import { db } from "../../database/connection";
import { roles } from "../../database/schema/roles";
import { eq } from "drizzle-orm";

const roleRoute = new Hono();

// Role Repository & Service (Inlined for simplicity as requested/standard in this project)
class RoleService {
    async getAll() {
        return await db.select().from(roles);
    }

    async getById(id: number) {
        const result = await db.select().from(roles).where(eq(roles.id, id)).limit(1);
        return result[0];
    }

    async create(data: { name: string; slug: string }) {
        return await db.insert(roles).values(data).returning();
    }

    async update(id: number, data: { name: string; slug: string }) {
        return await db.update(roles).set(data).where(eq(roles.id, id)).returning();
    }

    async delete(id: number) {
        return await db.delete(roles).where(eq(roles.id, id)).returning();
    }
}

import { NotFoundError } from "../../common/errors";

const service = new RoleService();

roleRoute.get("/", async (c: Context) => {
    const data = await service.getAll();
    return c.json({ data });
});

roleRoute.get("/:id", async (c: Context) => {
    const id = parseInt(c.req.param("id"));
    const data = await service.getById(id);
    if (!data) throw new NotFoundError("Role not found");
    return c.json({ data });
});

roleRoute.post("/", async (c: Context) => {
    const body = await c.req.json();
    const data = await service.create(body);
    return c.json({ data, message: "Role created" }, 201);
});

roleRoute.put("/:id", async (c: Context) => {
    const id = parseInt(c.req.param("id"));
    const body = await c.req.json();
    const data = await service.update(id, body);
    return c.json({ data, message: "Role updated" });
});

roleRoute.delete("/:id", async (c: Context) => {
    const id = parseInt(c.req.param("id"));
    await service.delete(id);
    return c.json({ message: "Role deleted" });
});

export default roleRoute;
