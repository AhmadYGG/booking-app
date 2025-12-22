import { Hono } from "hono";
import { PaymentController } from "./payment.controller";
import { PaymentService } from "./payment.service";
import { PaymentRepository } from "./payment.repository";
import { db } from "../../database/connection";
import { adminGuard } from "../../middleware/guard";
import { vValidator } from "@hono/valibot-validator";
import { createPaymentValidator } from "./payment.dto";

const route = new Hono();

const repo = new PaymentRepository(db);
const service = new PaymentService(repo);
const controller = new PaymentController(service);

route.get("/", adminGuard, (c) => controller.get(c));
route.get("/:id", adminGuard, (c) => controller.getByID(c));
route.post("/", adminGuard, vValidator("json", createPaymentValidator), (c) => controller.post(c));

export default route;
