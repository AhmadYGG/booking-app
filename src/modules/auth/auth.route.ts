import { Hono } from "hono";
import { UserService } from "../user/user.service";
import { UserRepository } from "../user/user.repository";
import { db } from "../../database/connection";
import { AuthService } from "./auth.service";
import { setCookie } from "hono/cookie";
import { cookieOption, cookieOptionNonHttp } from "../../common/cookieOption";
import { BadRequestError, UnauthorizedError } from "../../common/errors";
import { LoginDTO } from "./auth.dto";

const route = new Hono();

const userRepo = new UserRepository(db);
const userService = new UserService(userRepo);
const authService = new AuthService();

route.post("/login", async (c) => {
    const data = await c.req.json<LoginDTO>();
    const user = await userService.getByEmail(data.email);

    if (!user) {
        throw new UnauthorizedError("invalid email or password");
    }

    const verified = await authService.verifyPassword(
        data.password,
        user.password!,
    );

    if (!verified) {
        throw new UnauthorizedError("invalid email or password");
    }

    const userAgent = c.req.header("User-Agent")!;

    const [token, refreshToken] = await Promise.all([
        authService.createToken(user, 15),
        authService.createRefreshToken(user as any, userAgent),
    ]);
    setCookie(c, "token", token, cookieOption);
    setCookie(c, "role", user.role!, cookieOptionNonHttp);

    return c.json({
        message: "login success",
        role: user.role
    });
});

route.get("/logout", async (c) => {
    const userAgent = c.req.header("User-Agent")!;
    if (!userAgent) {
        throw new BadRequestError("You're already logout");
    }

    await authService.deleteRefreshToken(userAgent);

    setCookie(c, "token", "invalid", cookieOption);

    return c.json({ message: "You're logout" });
});

export default route;
