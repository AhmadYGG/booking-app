import { password } from "bun";
import { sign } from "hono/jwt";
import { JWTPayload } from "hono/utils/jwt/types";
import { CreateRefreshTokenDTO, CreateTokenDTO } from "./auth.dto";
import { db } from "../../database/connection";
import { refreshTokens } from "../../database/schema/refreshTokens";
import { eq, and } from "drizzle-orm";

export class AuthService {
	private secret: string = process.env.JWT_SECRET!;

	constructor() {}

	async verifyPassword(passwordTxt: string, hashPassword: string) {
		const verified = await password.verify(passwordTxt, hashPassword);
		if (!verified) {
			console.log("password not match");
		}
		return verified;
	}

	/**
	 * expired in minute
	 * */
	async createToken(payload: any, expired: number) {
		const jwtPayload: CreateTokenDTO = {
			id: payload.id,
			email: payload.email,
			role: payload.role || 'staff',
			exp: Math.floor(Date.now() / 1000) + 60 * expired,
		};
		return await sign(jwtPayload, this.secret);
	}

	async createRefreshToken(payload: CreateTokenDTO, userAgent: string) {
		const expired = 43200; // menit (1 bulan)
		const token = await this.createToken(payload, expired);
		const data: CreateRefreshTokenDTO = {
			email: payload.email,
			userAgent: userAgent,
			token: token,
		};
		
		await db
			.insert(refreshTokens)
			.values(data)
			.onConflictDoUpdate({
				target: refreshTokens.userAgent,
				set: {
					email: data.email,
					token: data.token,
				},
			});
		return token;
	}

	async deleteRefreshToken(userAgent: string) {
		return await db
			.delete(refreshTokens)
			.where(eq(refreshTokens.userAgent, userAgent));
	}
}
