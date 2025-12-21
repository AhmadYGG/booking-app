import { Context } from "hono";
import { UserService } from "../user/user.service";
import { AuthService } from "./auth.service";
import { LoginDTO } from "./auth.dto";
import { CreateUserDTO } from "../user/user.dto";
import { setCookie } from "hono/cookie";
import { cookieOption, cookieOptionNonHttp } from "../../common/cookieOption";

export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {}

  	async login(c: Context) {
		const data = await c.req.json<LoginDTO>();
		const user = await this.userService.getByEmail(data.email);
		if (!user) {
			return c.json({ message: "invalid email or password" }, 401);
		}

		const verified = await this.authService.verifyPassword(
			data.password,
			user.password!,
		);

		if (!verified) {
			return c.json({ message: "invalid email or password" }, 401);
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
			data: {
				token,
				refreshToken,
				user: {
					email: user.email,
					role: user.role,
				},
			},
		});
	}

  async logout(c: Context) {
    const userAgent = c.req.header("User-Agent")!;
    if (!userAgent) {
      return c.json({ message: "You're already logout" });
    }

    try {
      await this.authService.deleteRefreshToken(userAgent);
    } catch (error) {
      return c.json({ message: "You're already logout" });
    }

    setCookie(c, "token", "invalid", cookieOption);

    return c.json({ message: "You're logout" });
  }

  async register(c: Context) {
    const data = await c.req.json<CreateUserDTO>();
    try {
      await this.userService.create(data);
      return c.json({ message: "register success" });
    } catch (e: any) {
      console.log("error: ", e);
      return c.json({ message: "register failed", error: e.message }, 500);
    }
  }
}
