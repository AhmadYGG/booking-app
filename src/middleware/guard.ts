import "dotenv/config";
import { getCookie, setCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { decode, verify } from "hono/jwt";
import { cookieOption } from "../common/cookieOption";
import { recreateToken } from "./recreateToken";
import { CreateTokenDTO } from "../modules/auth/auth.dto";

export const adminGuard = createMiddleware(async (c, next) => {
	const secret = process.env.JWT_SECRET!;
	const token = getCookie(c, "token");

	if (!token) {
		return c.json({ message: "unauthorized" }, 401);
	}

	let payload!: CreateTokenDTO;

	try {
		payload = decode(token).payload as CreateTokenDTO;
	} catch (error) {
		return c.json({ message: "unauthorized" }, 401);
	}

	if (!payload) {
		return c.json({ message: "unauthorized" }, 401);
	}

	try {
		const verified = (await verify(token, secret)) as CreateTokenDTO;
		if (verified.role === "admin" || verified.role === "superadmin") {
			return next();
		}
		throw new Error();
	} catch (err) {
		const { newToken, status } = await recreateToken(
			c,
			token,
			payload.username,
		);
		if (!status) {
			return c.json({ message: "unauthorized" }, 401);
		}
		setCookie(c, "token", newToken, cookieOption);
		if (payload.role === "admin" || payload.role === "superadmin") {
			return next();
		}
	}

	return c.json({ message: "unauthorized" }, 401);
});

export const userGuard = createMiddleware(async (c, next) => {
	const secret = process.env.JWT_SECRET!;
	const token = getCookie(c, "token");

	if (!token) {
		return c.json({ message: "unauthorized" }, 401);
	}

	let payload!: CreateTokenDTO;

	try {
		payload = decode(token).payload as CreateTokenDTO;
	} catch (error) {
		return c.json({ message: "unauthorized" }, 401);
	}

	try {
		const verified = (await verify(token, secret)) as CreateTokenDTO;
		if (verified.role === "admin" || verified.role === "superadmin") {
			return next();
		}
	} catch (err) {
		const { newToken, status } = await recreateToken(
			c,
			token,
			payload.username,
		);

		if (!status) {
			return c.json({ message: "unauthorized" }, 401);
		}

		setCookie(c, "token", newToken, cookieOption);
	}

	// const checkUserID = payload.id === +c.req.param("id")!;
	// if (!checkUserID) {
	// 	return c.json({ message: "unauthorized" }, 401);
	// }

	return await next();
});
