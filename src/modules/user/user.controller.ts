import { Context } from "hono";
import { BlankEnv, BlankInput } from "hono/types";
import { UserService } from "./user.service";
import { CreateUserDTO, UpdateUserDTO } from "./user.dto";

export class UserController {
	constructor(private userService: UserService) {}
	async get(c: Context) {
		const page = parseInt(c.req.query("page") || "1");
		const limit = parseInt(c.req.query("limit") || "10");

		const data = await this.userService.getALl(page, limit);
		return c.json({
			message: "All Users",
			data: data.data,
			meta: {
				limit: data.limit,
				page: data.page,
				total: data.total,
			}
		});
	}

	async post(c: Context) {
		const data = await c.req.json<CreateUserDTO>();
		try {
			await this.userService.create(data);
			return c.json({ message: "register success" });
		} catch (e: any) {
			console.log("error: ", e);
			return c.json({ message: "register failed", error: e.message }, 500);
		}
	}

	async getByID(c: Context<BlankEnv, "/:id", BlankInput>) {
		const id = c.req.param("id");
		const data = await this.userService.getByID(+id);
		if (!data) {
			return c.json({ message: "User not found" }, 404);
		}
		return c.json({
			message: "user",
			data,
		});
	}

	async update(c: Context<BlankEnv, "/:id", BlankInput>) {
		const id = c.req.param("id");
		const data = await c.req.json<UpdateUserDTO>();
		console.log("data :", data);
		try {
			await this.userService.update(+id, data);
			return c.json({ message: "Update User Success" }, 201);
		} catch (_) {
			return c.json({ message: "Update User Failed" }, 500);
		}
	}

	async delete(c: Context<BlankEnv, "/:id", BlankInput>) {
		const id = c.req.param("id");
		try {
			await this.userService.delete(+id);
			return c.json({ message: "Delete User Success" }, 201);
		} catch (_) {
			return c.json({ message: "Delete User Failed" }, 500);
		}
	}
}
