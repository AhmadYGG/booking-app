import { Hono } from "hono";
import { ServiceService } from "./service.service";
import { ServiceRepository } from "./service.repository";
import { db } from "../../database/connection";
import { adminGuard } from "../../middleware/guard";
import { vValidator } from "@hono/valibot-validator";
import { CreateServiceSchema, UpdateServiceSchema, ToggleServiceStatusSchema } from "./service.dto";
import { NotFoundError } from "../../common/errors";

const route = new Hono();

const serviceRepo = new ServiceRepository(db);
const serviceService = new ServiceService(serviceRepo);

route.get("/", async (c) => {
    const page = parseInt(c.req.query("page") || "1");
    const limit = parseInt(c.req.query("limit") || "10");
    const data = await serviceService.getAll(page, limit);
    return c.json({
        message: "All Services",
        data: data.data,
        meta: {
            limit: data.limit,
            page: data.page,
            total: data.total,
        }
    });
});

route.get("/:id", async (c) => {
    const id = parseInt(c.req.param("id"));
    const data = await serviceService.getByID(id);
    if (!data) throw new NotFoundError("Service not found");
    return c.json({ data });
});

route.post("/", adminGuard, vValidator("json", CreateServiceSchema), async (c) => {
    const body = await c.req.json();
    const data = await serviceService.create(body);
    return c.json({ data, message: "Service created successfully" }, 201);
});

route.put("/:id", adminGuard, vValidator("json", UpdateServiceSchema), async (c) => {
    const id = parseInt(c.req.param("id"));
    const body = await c.req.json();
    const data = await serviceService.update(id, body);
    if (!data || data.length === 0) throw new NotFoundError("Service not found");
    return c.json({ data: data[0], message: "Service updated successfully" });
});

route.patch("/:id/status", adminGuard, vValidator("json", ToggleServiceStatusSchema), async (c) => {
    const id = parseInt(c.req.param("id"));
    const body = await c.req.json();
    const data = await serviceService.updateStatus(id, body.isActive);
    if (!data || data.length === 0) throw new NotFoundError("Service not found");
    return c.json({ data: data[0], message: `Service ${body.isActive ? 'activated' : 'deactivated'} successfully` });
});

route.delete("/:id", adminGuard, async (c) => {
    const id = parseInt(c.req.param("id"));
    const data = await serviceService.delete(id);
    if (!data || data.length === 0) throw new NotFoundError("Service not found");
    return c.json({ message: "Service deleted successfully" });
});

export default route;
