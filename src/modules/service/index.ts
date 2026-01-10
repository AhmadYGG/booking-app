import { Hono } from "hono";
import { ServiceService } from "./service.service";
import { ServiceRepository } from "./service.repository";
import { db } from "../../database/connection";
import { adminGuard } from "../../middleware/guard";
import { validator } from "hono-openapi";
import {
    CreateServiceSchema,
    UpdateServiceSchema,
    ToggleServiceStatusSchema,
    getAllServicesRouteSchema,
    getServiceByIdRouteSchema,
    createServiceRouteSchema,
    updateServiceRouteSchema,
    toggleServiceStatusRouteSchema,
    deleteServiceRouteSchema,
} from "./service.dto";
import { NotFoundError } from "../../common/errors";

const route = new Hono();

const serviceRepo = new ServiceRepository(db);
const serviceService = new ServiceService(serviceRepo);

route.get("/", getAllServicesRouteSchema, async (c) => {
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

route.get("/:id", getServiceByIdRouteSchema, async (c) => {
    const id = parseInt(c.req.param("id"));
    const data = await serviceService.getByID(id);
    if (!data) throw new NotFoundError("Service not found");
    return c.json({ data });
});

route.post("/", createServiceRouteSchema, adminGuard, validator("json", CreateServiceSchema), async (c) => {
    const body = await c.req.json();
    const data = await serviceService.create(body);
    return c.json({ message: "Service created successfully" }, 201);
});

route.put("/:id", updateServiceRouteSchema, adminGuard, validator("json", UpdateServiceSchema), async (c) => {
    const id = parseInt(c.req.param("id"));
    const body = await c.req.json();
    const data = await serviceService.update(id, body);
    if (!data || data.length === 0) throw new NotFoundError("Service not found");
    return c.json({ message: "Service updated successfully" });
});

route.patch("/:id/status", toggleServiceStatusRouteSchema, adminGuard, validator("json", ToggleServiceStatusSchema), async (c) => {
    const id = parseInt(c.req.param("id"));
    const body = await c.req.json();
    const data = await serviceService.updateStatus(id, body.isActive);
    if (!data || data.length === 0) throw new NotFoundError("Service not found");
    return c.json({ message: `Service ${body.isActive ? 'activated' : 'deactivated'} successfully` });
});

route.delete("/:id", deleteServiceRouteSchema, adminGuard, async (c) => {
    const id = parseInt(c.req.param("id"));
    const data = await serviceService.delete(id);
    if (!data || data.length === 0) throw new NotFoundError("Service not found");
    return c.json({ message: "Service deleted successfully" });
});

export default route;
