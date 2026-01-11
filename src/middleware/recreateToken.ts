import { Context } from "hono";
import { decode, verify } from "hono/jwt";
import { db } from "../database/connection";
import { AuthService } from "../modules/auth/auth.service";
import { CreateTokenDTO } from "../modules/auth/auth.dto";
import { AuthRepository } from "../modules/auth/auth.repository";
import { refreshTokens } from "../database/schema/refreshTokens";
import { and, eq } from "drizzle-orm";

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
	email: string,
): Promise<{ newToken: string; status: boolean }> {
	const userAgent = c.req.header("User-Agent")!;

	const authRepo = new AuthRepository(db);
	const authService = new AuthService(authRepo);
	const refreshTokenData = await db
		.select()
		.from(refreshTokens)
		.where(
			and(
				eq(refreshTokens.userAgent, userAgent),
				eq(refreshTokens.email, email),
			),
		)
		.limit(1);

	const refreshToken = refreshTokenData[0];

	if (!refreshToken) {
		return {
			newToken: "",
			status: false,
		};
	}

	const verified = await verifyRefreshToken(refreshToken.token);

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
