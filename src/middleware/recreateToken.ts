import { Context } from "hono";
import { decode, verify } from "hono/jwt";
import { AuthRepository } from "../modules/auth/auth.repository";
import { db } from "../database/connection";
import { AuthService } from "../modules/auth/auth.service";
import { CreateTokenDTO } from "../modules/auth/auth.dto";

export async function verifyRefreshToken(token: string) {
	const secret = process.env.JWT_SECRET!;

	try {
		await verify(token, secret);
	} catch (err) {
		return false;
	}

	return true;
}

export async function recreateToken(
	c: Context,
	token: string,
	username: string,
): Promise<{ newToken: string; status: boolean }> {
	const userAgent = c.req.header("User-Agent")!;

	const authRepo = new AuthRepository(db);
	const authService = new AuthService(authRepo);
	const refreshToken = await authRepo.findByUserAgentAndUsername(
		userAgent,
		username,
	);

	if (!refreshToken) {
		return {
			newToken: "",
			status: false,
		};
	}

	const verified = await verifyRefreshToken(refreshToken!.token);

	if (!verified) {
		return {
			newToken: "",
			status: false,
		};
	}

	const { payload } = decode(token);
	const newPayload = payload as CreateTokenDTO;
	const newToken = await authService.createToken(newPayload, 15);

	return {
		newToken,
		status: true,
	};
}
