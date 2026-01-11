import { JWTPayload } from "hono/utils/jwt/types";
import { refreshTokens } from "../../database/schema/refreshTokens";
import { describeRoute, resolver } from "hono-openapi";
import * as v from "valibot";

// Request/Response Schemas
export const loginRequestSchema = v.object({
	email: v.pipe(v.string(), v.email()),
	password: v.pipe(v.string(), v.minLength(1)),
});

export const loginResponseSchema = v.object({
	message: v.string(),
	role: v.optional(v.string()),
});

export const logoutResponseSchema = v.object({
	message: v.string(),
});

export const checkAuthResponseSchema = v.object({
	success: v.boolean(),
});

// Types
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

// OpenAPI Route Descriptions
export const loginRouteSchema = describeRoute({
	tags: ["Auth"],
	summary: "User Login",
	description: "Authenticate a user and return a JWT token in cookie",
	responses: {
		200: {
			description: "Login successful",
			content: {
				"application/json": { schema: resolver(loginResponseSchema) },
			},
		},
		401: {
			description: "Invalid email or password",
		},
	},
});

export const logoutRouteSchema = describeRoute({
	tags: ["Auth"],
	summary: "User Logout",
	description: "Invalidate the session and clear the token cookie",
	responses: {
		200: {
			description: "Logout successful",
			content: {
				"application/json": { schema: resolver(logoutResponseSchema) },
			},
		},
		400: {
			description: "Already logged out",
		},
	},
});

export const checkAuthRouteSchema = describeRoute({
	tags: ["Auth"],
	summary: "Check Authentication",
	description: "Verify if the current session is still valid",
	responses: {
		200: {
			description: "Session is valid",
			content: {
				"application/json": { schema: resolver(checkAuthResponseSchema) },
			},
		},
		401: {
			description: "Unauthorized",
		},
	},
});
