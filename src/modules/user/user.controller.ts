import { Context } from "hono";
import { BlankEnv, BlankInput } from "hono/types";
import { UserService } from "./user.service";
import { CreateUserDTO, UpdateUserDTO } from "./user.dto";
import { NotFoundError } from "../../common/errors";

export class UserController {
	constructor(private userService: UserService) { }
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
		await this.userService.create(data);
		return c.json({ message: "register success" }, 201);
	}

	async getByID(c: Context<BlankEnv, "/:id", BlankInput>) {
		const id = c.req.param("id");
		const data = await this.userService.getByID(+id);
		if (!data) {
			throw new NotFoundError("User not found");
		}
		return c.json({
			message: "user",
			data,
		});
	}

	async update(c: Context<BlankEnv, "/:id", BlankInput>) {
		const id = c.req.param("id");
		const data = await c.req.json<UpdateUserDTO>();
		await this.userService.update(+id, data);
		return c.json({ message: "Update User Success" });
	}

	async delete(c: Context<BlankEnv, "/:id", BlankInput>) {
		const id = c.req.param("id");
		await this.userService.delete(+id);
		return c.json({ message: "Delete User Success" });
	}
}
