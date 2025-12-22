import { Hono } from "hono";
import { BookingController } from "./booking.controller";
import { BookingService } from "./booking.service";
import { BookingRepository } from "./booking.repository";
import { db } from "../../database/connection";
import { adminGuard, userGuard } from "../../middleware/guard";
import { vValidator } from "@hono/valibot-validator";
import { createBookingValidator, updateBookingStatusValidator } from "./booking.dto";

const route = new Hono();

const repo = new BookingRepository(db);
const service = new BookingService(repo);
const controller = new BookingController(service);

route.get("/", adminGuard, (c) => controller.get(c));
route.get("/:id", adminGuard, (c) => controller.getByID(c));
route.post("/", userGuard, vValidator("json", createBookingValidator), (c) => controller.post(c));
route.patch("/:id/status", adminGuard, vValidator("json", updateBookingStatusValidator), (c) => controller.updateStatus(c));

export default route;
