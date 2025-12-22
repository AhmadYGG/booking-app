import "dotenv/config";
import { Hono } from 'hono'
import { cors } from "hono/cors";
import auth from "./modules/auth";
import role from "./modules/role";
import permission from "./modules/permission";
import user from "./modules/user/user.route";

import booking from "./modules/booking/booking.route";
import payment from "./modules/payment/payment.route";
import service from "./modules/service/service.route";

import { AppError } from "./common/errors";

const app = new Hono()
app.use("*", cors());

app.onError((err, c) => {
	// 1. Log the error for the developer
	console.error(`[ERROR] ${err.name}: ${err.message}`);
	if (process.env.NODE_ENV !== "production") {
		console.error(err.stack);
	}

	// 2. If it's our custom AppError, use its status code
	if (err instanceof AppError) {
		return c.json({
			message: err.message,
			code: err.statusCode,
		}, err.statusCode as any);
	}

	// 3. Fallback for unexpected errors
	return c.json(
		{
			message: "Internal Server Error!",
			detail: process.env.NODE_ENV !== "production" ? err.message : undefined,
		},
		500,
	);
});

const api = new Hono();
api.route("/auth", auth);
api.route("/roles", role);
api.route("/permissions", permission);
api.route("/users", user);
api.route("/bookings", booking);
api.route("/payments", payment);
api.route("/services", service);

app.route("/api", api);

export default app