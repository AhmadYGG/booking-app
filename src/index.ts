import "dotenv/config";
import { Hono } from 'hono'
import { cors } from "hono/cors";
import auth from "./modules/auth";
import role from "./modules/role";
import permission from "./modules/permission";
import user from "./modules/user";

import booking from "./modules/booking";
import payment from "./modules/payment";
import service from "./modules/service";

import { AppError } from "./common/errors";
import { swaggerUI } from "@hono/swagger-ui";
import { openAPIRouteHandler } from "hono-openapi";

const app = new Hono()
app.use("*", cors({
	origin: (origin) => {
		// Allow any localhost for development, or specify your frontend origins
		if (origin?.includes("localhost")) return origin;
		return "http://localhost:5173"; // Default Vite port
	},
	credentials: true,
}));

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

// OpenAPI Documentation
api.get("/doc", openAPIRouteHandler(app, {
	documentation: {
		info: {
			title: "Booking App API",
			version: "1.0.0",
			description: "API for managing bookings, services, payments and users",
		},
		servers: [{ url: "http://localhost:3000", description: "Local Server" }],
	},
}));
api.get("/ui", swaggerUI({ url: "/api/doc" }));

app.route("/api", api);

export default app