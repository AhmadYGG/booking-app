import { Context, Next } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { jwt, decode } from "hono/jwt";
import { cookieOption } from "../common/cookieOption";
import { recreateToken } from "./recreateToken";
import { CreateTokenDTO } from "../modules/auth/auth.dto";

const secret = process.env.JWT_SECRET!;

export const authGuard = jwt({
  secret: secret,
  cookie: "token",
});

export const adminGuard = createMiddleware(async (c: Context, next: Next) => {
  const authMiddleware = jwt({
    secret: secret,
    cookie: "token",
  });

  try {
    let authSuccess = false;
    await authMiddleware(c, async () => {
      authSuccess = true;
    });

    if (authSuccess) {
      const payload = c.get("jwtPayload") as CreateTokenDTO;
      if (payload.role === "admin" || payload.role === "owner") {
        return next();
      }
      return c.json({ message: "forbidden: admin access required" }, 403);
    }
    return c.json({ message: "unauthorized" }, 401);
  } catch (err) {
    const token = getCookie(c, "token") || c.req.header("Authorization")?.replace("Bearer ", "");
    if (!token) return c.json({ message: "unauthorized" }, 401);

    const decodedToken = decode(token);
    const payload = decodedToken.payload as CreateTokenDTO;
    const { newToken, status } = await recreateToken(c, token, payload.email);

    if (!status) return c.json({ message: "unauthorized" }, 401);

    setCookie(c, "token", newToken, cookieOption);
    if (payload.role === "admin" || payload.role === "owner") {
      return next();
    }
    return c.json({ message: "forbidden" }, 403);
  }
});

export const userGuard = createMiddleware(async (c: Context, next: Next) => {
  const authMiddleware = jwt({
    secret: secret,
    cookie: "token",
  });

  try {
    let authSuccess = false;
    await authMiddleware(c, async () => {
      authSuccess = true;
    });

    if (authSuccess) {
      return next();
    }
    return c.json({ message: "unauthorized" }, 401);
  } catch (err) {
    const token = getCookie(c, "token") || c.req.header("Authorization")?.replace("Bearer ", "");
    if (!token) return c.json({ message: "unauthorized" }, 401);

    const decodedToken = decode(token);
    const payload = decodedToken.payload as CreateTokenDTO;
    const { newToken, status } = await recreateToken(c, token, payload.email);

    if (!status) return c.json({ message: "unauthorized" }, 401);

    setCookie(c, "token", newToken, cookieOption);
    return next();
  }
});
