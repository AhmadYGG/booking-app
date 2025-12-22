import { Hono } from "hono";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { UserRepository } from "./user.repository";
import { db } from "../../database/connection";
import { adminGuard, userGuard } from "../../middleware/guard";
import { permissionGuard } from "../../middleware/permissionGuard";
import { vValidator } from "@hono/valibot-validator";
import { createUserValidator, updateUserValidator } from "./user.dto";

const route = new Hono();

const userRepo = new UserRepository(db);
const userService = new UserService(userRepo);
const controller = new UserController(userService);

route.get("/", adminGuard, permissionGuard("user.view"), (c) => controller.get(c));
route.post("/", adminGuard, vValidator("json", createUserValidator), (c) =>
	controller.post(c),
);
route.get("/:id", adminGuard, permissionGuard("user.view"), (c) => controller.getByID(c));
route.put("/:id", adminGuard, vValidator("json", updateUserValidator), (c) =>
	controller.update(c),
);
route.delete("/:id", adminGuard, (c) => controller.delete(c));

export default route;
