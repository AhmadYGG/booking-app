import { Hono } from "hono";
import { UserService } from "./user.service";
import { UserRepository } from "./user.repository";
import { db } from "../../database/connection";
import { adminGuard } from "../../middleware/guard";
import { permissionGuard } from "../../middleware/permissionGuard";
import { validator } from "hono-openapi";
import {
	createUserValidator,
	updateUserValidator,
	CreateUserDTO,
	UpdateUserDTO,
	getAllUsersRouteSchema,
	createUserRouteSchema,
	getUserByIdRouteSchema,
	updateUserRouteSchema,
	deleteUserRouteSchema,
} from "./user.dto";
import { NotFoundError } from "../../common/errors";

const route = new Hono();

const userRepo = new UserRepository(db);
const userService = new UserService(userRepo);

route.get("/", getAllUsersRouteSchema, adminGuard, permissionGuard("user.view"), async (c) => {
	const page = parseInt(c.req.query("page") || "1");
	const limit = parseInt(c.req.query("limit") || "10");

	const data = await userService.getALl(page, limit);
	return c.json({
		message: "All Users",
		data: data.data,
		meta: {
			limit: data.limit,
			page: data.page,
			total: data.total,
		}
	});
});

route.post("/", createUserRouteSchema, adminGuard, validator("json", createUserValidator), async (c) => {
	const data = await c.req.json<CreateUserDTO>();
	await userService.create(data);
	return c.json({ message: "register success" }, 201);
});

route.get("/:id", getUserByIdRouteSchema, adminGuard, permissionGuard("user.view"), async (c) => {
	const id = c.req.param("id");
	const data = await userService.getByID(+id);
	if (!data) {
		throw new NotFoundError("User not found");
	}
	return c.json({
		message: "user",
		data,
	});
});

route.put("/:id", updateUserRouteSchema, adminGuard, validator("json", updateUserValidator), async (c) => {
	const id = c.req.param("id");
	const data = await c.req.json<UpdateUserDTO>();
	await userService.update(+id, data);
	return c.json({ message: "Update User Success" });
});

route.delete("/:id", deleteUserRouteSchema, adminGuard, async (c) => {
	const id = c.req.param("id");
	await userService.delete(+id);
	return c.json({ message: "Delete User Success" });
});

export default route;
