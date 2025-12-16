import { password } from "bun";
import { sign } from "hono/jwt";
import { JWTPayload } from "hono/utils/jwt/types";
import { CreateRefreshTokenDTO, CreateTokenDTO } from "./auth.dto";
import { AuthRepository } from "./auth.repository";

export class AuthService {
	private secret: string = process.env.JWT_SECRET!;

	constructor(private authRepo: AuthRepository) {}

	async veryfy(passwordTxt: string, hashPassword: string) {
		const verified = await password.verify(passwordTxt, hashPassword);
		if (!verified) {
			console.log("password not match");
		}
		return verified;
	}

	/**
	 * expired in minute
	 * */
	async createToken(payload: CreateTokenDTO, expired: number) {
		const jwtPayload: JWTPayload = {
			id: payload.id,
			username: payload.username,
			position: payload.position,
			role: payload.role,
			exp: Math.floor(Date.now() / 1000) + 60 * expired,
		};
		return await sign(jwtPayload, this.secret);
	}

	async createRefreshToken(payload: CreateTokenDTO, userAgent: string) {
		const expired = 43200; // menit (1 bulan)
		const token = await this.createToken(payload, expired);
		const data: CreateRefreshTokenDTO = {
			username: payload.username,
			userAgent: userAgent,
			token: token,
		};
		await this.authRepo.creteRefreshToken(data);
	}

	async deleteRefreshToken(userAgent: string) {
		return await this.authRepo.delete(userAgent);
	}
}
