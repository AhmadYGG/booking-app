import { CookieOptions } from "hono/utils/cookie";

export const cookieOption: CookieOptions = {
	path: "/",
	httpOnly: true,
	secure: false,
	sameSite: "lax",
	maxAge: 60 * 60 * 24 * 30,
};

export const cookieOptionNonHttp: CookieOptions = {
	path: "/",
	httpOnly: false,
	secure: false,
	sameSite: "lax",
	maxAge: 60 * 60 * 24 * 30,
};
