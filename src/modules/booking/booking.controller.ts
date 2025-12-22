import { Context } from "hono";
import { BookingService } from "./booking.service";
import { CreateBookingDTO, UpdateBookingStatusDTO } from "./booking.dto";
import { NotFoundError } from "../../common/errors";

export class BookingController {
    constructor(private bookingService: BookingService) { }

    async get(c: Context) {
        const page = parseInt(c.req.query("page") || "1");
        const limit = parseInt(c.req.query("limit") || "10");

        const data = await this.bookingService.getAll(page, limit);
        return c.json({
            message: "All Bookings",
            data: data.data,
            meta: {
                limit: data.limit,
                page: data.page,
                total: data.total,
            }
        });
    }

    async getByID(c: Context) {
        const id = parseInt(c.req.param("id"));
        const data = await this.bookingService.getByID(id);
        if (!data) throw new NotFoundError("Booking not found");
        return c.json({ data });
    }

    async post(c: Context) {
        const body = await c.req.json<CreateBookingDTO>();
        const data = await this.bookingService.create(body);
        return c.json({ data, message: "Booking created successfully" }, 201);
    }

    async updateStatus(c: Context) {
        const id = parseInt(c.req.param("id"));
        const body = await c.req.json<UpdateBookingStatusDTO>();
        const data = await this.bookingService.updateStatus(id, body.status);
        return c.json({ data, message: "Booking status updated" });
    }
}
