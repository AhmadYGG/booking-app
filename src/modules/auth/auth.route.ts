import { Hono } from "hono";
import { AuthController } from "./auth.controller";
import { UserService } from "../user/user.service";
import { UserRepository } from "../user/user.repository";
import { db } from "../../database/connection";
import { AuthService } from "./auth.service";

const route = new Hono();

const userRepo = new UserRepository(db);
const userService = new UserService(userRepo);
const authService = new AuthService();
const controller = new AuthController(authService, userService);

route.post("/login", (c) => controller.login(c));
route.get("/logout", (c) => controller.logout(c));

export default route;
