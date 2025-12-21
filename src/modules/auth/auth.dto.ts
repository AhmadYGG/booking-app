import { JWTPayload } from "hono/utils/jwt/types";
import { refreshTokens } from "../../database/schema/refreshTokens";

export interface LoginDTO {
	email: string;
	password: string;
}

export interface CreateTokenDTO extends JWTPayload {
	id: number;
	email: string;
	role: string;
}

export type CreateRefreshTokenDTO = typeof refreshTokens.$inferInsert;
