import { Hono } from 'hono'
import { cors } from "hono/cors";
import auth from "./modules/auth";
import role from "./modules/role";
import permission from "./modules/permission";
import user from "./modules/user/user.route";

const app = new Hono()
app.use("*", cors());

app.onError((err, c) => {
	console.error(`[GLOBAL ERROR HANDLER] Error: ${err.message}`);
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

app.route("/api", api);

export default app