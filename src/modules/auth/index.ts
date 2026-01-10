import { Hono } from "hono";
import { UserService } from "../user/user.service";
import { UserRepository } from "../user/user.repository";
import { db } from "../../database/connection";
import { AuthService } from "./auth.service";
import { getCookie, setCookie } from "hono/cookie";
import { cookieOption, cookieOptionNonHttp } from "../../common/cookieOption";
import { BadRequestError, UnauthorizedError } from "../../common/errors";
import { LoginDTO, loginRouteSchema, logoutRouteSchema, loginRequestSchema } from "./auth.dto";
import { validator } from "hono-openapi";
import { JWTPayload } from "hono/utils/jwt/types";

const route = new Hono();

const userRepo = new UserRepository(db);
const userService = new UserService(userRepo);
const authService = new AuthService();

route.post("/login", loginRouteSchema, validator("json", loginRequestSchema), async (c) => {
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

    const userAgent = c.req.header("User-Agent") || "unknown";

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

route.get("/logout", logoutRouteSchema, async (c) => {
    const token = getCookie(c, "token");
    let payload!: JWTPayload;

    if (!token) {
        return c.json({ message: "unauthorized" }, 401);
    }

    try {
        payload = decode(token!).payload as JWTPayload;
    } catch (error) {
        return c.json({ message: "unauthorized" }, 401);
    }

    try {
        await authService.logout(token);
        deleteCookie(c, "token");
        return c.json({ message: "Logout Success" });
    } catch (e: any) {
        return c.json({ message: e.message }, 500);
    }
});

export default route;
