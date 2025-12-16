import { JWTPayload } from "hono/utils/jwt/types";
import { refreshTokens } from "../../database/schema/refreshTokens";

export interface LoginDTO {
	username: string;
	password: string;
}

export interface CreateTokenDTO extends JWTPayload {
	id: number;
	username: string;
	position: string;
	role: string;
}

export type CreateRefreshTokenDTO = typeof refreshTokens.$inferInsert;
