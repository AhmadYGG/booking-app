import { Hono } from "hono";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { UserRepository } from "./user.repository";
import { db } from "../../database/connection";
import { adminGuard, userGuard } from "../../middleware/guard";
import { PositionRepository } from "../position/position.repository";
import { sValidator } from "@hono/standard-validator";
import { createUserValidator, updateUserValidator } from "./user.dto";

const route = new Hono();

const userRepo = new UserRepository(db);
const positionRepo = new PositionRepository(db);
const userService = new UserService(userRepo, positionRepo);
const controller = new UserController(userService);

route.get("/", adminGuard, (c) => controller.get(c));
route.post("/", adminGuard, sValidator("json", createUserValidator), (c) =>
	controller.post(c),
);
route.get("/:id", userGuard, (c) => controller.getByID(c));
route.put("/:id", adminGuard, sValidator("json", updateUserValidator), (c) =>
	controller.update(c),
);
route.delete("/:id", adminGuard, (c) => controller.delete(c));

export default route;
