import { Hono } from "hono";
import { AuthController } from "./auth.controller";
import { UserService } from "../user/user.service";
import { UserRepository } from "../user/user.repository";
import { db } from "../../database/connection";
import { AuthService } from "./auth.service";
import { AuthRepository } from "./auth.repository";
import { PositionRepository } from "../position/position.repository";

const route = new Hono();

const userRepo = new UserRepository(db);
const authRepo = new AuthRepository(db);
const positionRepo = new PositionRepository(db);
const userService = new UserService(userRepo, positionRepo);
const authService = new AuthService(authRepo);
const controller = new AuthController(authService, userService);

route.post("/login", (c) => controller.login(c));
route.post("/register", (c) => controller.register(c));
route.get("/logout", (c) => controller.logout(c));

export default route;
