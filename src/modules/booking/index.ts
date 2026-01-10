import { Hono } from "hono";
import { BookingService } from "./booking.service";
import { BookingRepository } from "./booking.repository";
import { db } from "../../database/connection";
import { adminGuard, userGuard } from "../../middleware/guard";
import { validator } from "hono-openapi";
import {
    createBookingValidator,
    updateBookingStatusValidator,
    CreateBookingDTO,
    UpdateBookingStatusDTO,
    getAllBookingsRouteSchema,
    getBookingByIdRouteSchema,
    getCustomerHistoryRouteSchema,
    createBookingRouteSchema,
    updateBookingStatusRouteSchema,
} from "./booking.dto";
import { NotFoundError } from "../../common/errors";

const route = new Hono();

const repo = new BookingRepository(db);
const service = new BookingService(repo);

route.get("/", getAllBookingsRouteSchema, adminGuard, async (c) => {
    const page = parseInt(c.req.query("page") || "1");
    const limit = parseInt(c.req.query("limit") || "10");

    const data = await service.getAll(page, limit);
    return c.json({
        message: "All Bookings",
        data: data.data,
        meta: {
            limit: data.limit,
            page: data.page,
            total: data.total,
        }
    });
});

route.get("/:id", getBookingByIdRouteSchema, adminGuard, async (c) => {
    const id = parseInt(c.req.param("id"));
    const data = await service.getByID(id);
    if (!data) throw new NotFoundError("Booking not found");
    return c.json({ data });
});

route.get("/customer/:id/history", getCustomerHistoryRouteSchema, adminGuard, async (c) => {
    const id = parseInt(c.req.param("id"));
    const data = await service.getCustomerHistory(id);
    return c.json({ data });
});

route.post("/", createBookingRouteSchema, userGuard, validator("json", createBookingValidator), async (c) => {
    const body = await c.req.json<CreateBookingDTO>();
    const data = await service.create(body);
    return c.json({ data, message: "Booking created successfully" }, 201);
});

route.patch("/:id/status", updateBookingStatusRouteSchema, adminGuard, validator("json", updateBookingStatusValidator), async (c) => {
    const id = parseInt(c.req.param("id"));
    const body = await c.req.json<UpdateBookingStatusDTO>();
    const data = await service.updateStatus(id, body.status);
    return c.json({ data, message: "Booking status updated" });
});

export default route;
