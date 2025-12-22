import { Context } from "hono";
import { UserService } from "../user/user.service";
import { AuthService } from "./auth.service";
import { LoginDTO } from "./auth.dto";
import { setCookie } from "hono/cookie";
import { cookieOption, cookieOptionNonHttp } from "../../common/cookieOption";
import { BadRequestError, UnauthorizedError } from "../../common/errors";

export class AuthController {
	constructor(
		private authService: AuthService,
		private userService: UserService,
	) { }

	async login(c: Context) {
		const data = await c.req.json<LoginDTO>();
		const user = await this.userService.getByEmail(data.email);

		if (!user) {
			throw new UnauthorizedError("invalid email or password");
		}

		const verified = await this.authService.verifyPassword(
			data.password,
			user.password!,
		);

		if (!verified) {
			throw new UnauthorizedError("invalid email or password");
		}

		const userAgent = c.req.header("User-Agent")!;

		const [token, refreshToken] = await Promise.all([
			this.authService.createToken(user, 15),
			this.authService.createRefreshToken(user as any, userAgent),
		]);
		setCookie(c, "token", token, cookieOption);
		setCookie(c, "role", user.role!, cookieOptionNonHttp);

		return c.json({
			message: "login success",
			role: user.role
		});
	}

	async logout(c: Context) {
		const userAgent = c.req.header("User-Agent")!;
		if (!userAgent) {
			throw new BadRequestError("You're already logout");
		}

		// Let service throw if needed, or catch and rethrow as AppError
		await this.authService.deleteRefreshToken(userAgent);

		setCookie(c, "token", "invalid", cookieOption);

		return c.json({ message: "You're logout" });
	}
}
