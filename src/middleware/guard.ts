import { Context, Next } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { jwt, decode, verify } from "hono/jwt";
import { cookieOption } from "../common/cookieOption";
import { recreateToken } from "./recreateToken";
import { CreateTokenDTO } from "../modules/auth/auth.dto";

export const adminGuard = createMiddleware(async (c: Context, next: Next) => {
  const secret = process.env.JWT_SECRET!;
  const token = getCookie(c, "token") || c.req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return c.json({ message: "unauthorized" }, 401);

  try {
    // Verify manually because Hono's jwt middleware is hard to combine with custom refresh logic
    const payload = await verify(token, secret) as CreateTokenDTO;
    c.set("jwtPayload", payload);

    if (payload.role === "admin" || payload.role === "owner") {
      return next();
    }
    return c.json({ message: "forbidden: admin access required" }, 403);
  } catch (err) {
    const decodedToken = decode(token);
    const payload = decodedToken.payload as CreateTokenDTO;
    const { newToken, status } = await recreateToken(c, token, payload.email);

    if (!status) return c.json({ message: "unauthorized" }, 401);

    setCookie(c, "token", newToken, cookieOption);

    // Hydrate context for subsequent middlewares
    c.set("jwtPayload", payload);

    if (payload.role === "admin" || payload.role === "owner") {
      return next();
    }
    return c.json({ message: "forbidden" }, 403);
  }
});

export const userGuard = createMiddleware(async (c: Context, next: Next) => {
  const secret = process.env.JWT_SECRET!;
  const token = getCookie(c, "token") || c.req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return c.json({ message: "unauthorized" }, 401);

  try {
    const payload = await verify(token, secret) as CreateTokenDTO;
    c.set("jwtPayload", payload);
    return next();
  } catch (err) {
    const decodedToken = decode(token);
    const payload = decodedToken.payload as CreateTokenDTO;
    const { newToken, status } = await recreateToken(c, token, payload.email);

    if (!status) return c.json({ message: "unauthorized" }, 401);

    setCookie(c, "token", newToken, cookieOption);

    // Hydrate context
    c.set("jwtPayload", payload);
    return next();
  }
});
