import { Context } from "hono";
import { PaymentService } from "./payment.service";
import { CreatePaymentDTO } from "./payment.dto";

export class PaymentController {
    constructor(private paymentService: PaymentService) { }

    async get(c: Context) {
        const page = parseInt(c.req.query("page") || "1");
        const limit = parseInt(c.req.query("limit") || "10");

        const data = await this.paymentService.getAll(page, limit);
        return c.json({
            message: "All Payments",
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
        const data = await this.paymentService.getByID(id);
        if (!data) return c.json({ message: "Payment not found" }, 404);
        return c.json({ data });
    }

    async post(c: Context) {
        try {
            const body = await c.req.json<CreatePaymentDTO>();
            const data = await this.paymentService.processPayment(body);
            return c.json({ data, message: "Payment recorded and booking confirmed" }, 201);
        } catch (e: any) {
            return c.json({ message: e.message || "Failed to process payment" }, 400);
        }
    }
}
