import { Hono } from "hono";
import { PaymentService } from "./payment.service";
import { PaymentRepository } from "./payment.repository";
import { db } from "../../database/connection";
import { adminGuard } from "../../middleware/guard";
import { validator } from "hono-openapi";
import {
    createPaymentValidator,
    CreatePaymentDTO,
    getAllPaymentsRouteSchema,
    getPaymentByIdRouteSchema,
    createPaymentRouteSchema,
} from "./payment.dto";
import { NotFoundError } from "../../common/errors";

const route = new Hono();

const repo = new PaymentRepository(db);
const service = new PaymentService(repo);

route.get("/", getAllPaymentsRouteSchema, adminGuard, async (c) => {
    const page = parseInt(c.req.query("page") || "1");
    const limit = parseInt(c.req.query("limit") || "10");

    const data = await service.getAll(page, limit);
    return c.json({
        message: "All Payments",
        data: data.data,
        meta: {
            limit: data.limit,
            page: data.page,
            total: data.total,
        }
    });
});

route.get("/:id", getPaymentByIdRouteSchema, adminGuard, async (c) => {
    const id = parseInt(c.req.param("id"));
    const data = await service.getByID(id);
    if (!data) throw new NotFoundError("Payment not found");
    return c.json({ data });
});

route.post("/", createPaymentRouteSchema, adminGuard, validator("json", createPaymentValidator), async (c) => {
    const body = await c.req.json<CreatePaymentDTO>();
    const data = await service.processPayment(body);
    return c.json({ data, message: "Payment recorded and booking confirmed" }, 201);
});

export default route;
