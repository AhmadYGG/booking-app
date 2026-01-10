import { users } from "../../database/schema/users";
import * as v from "valibot";
import { describeRoute, resolver } from "hono-openapi";

// Types
export type CreateUserDTO = typeof users.$inferInsert;
export type UpdateUserDTO = {
	name: string;
	email: string;
	phone?: string;
	role?: string;
	isActive?: boolean;
	password?: string;
};

// Request Schemas
export const createUserValidator = v.object({
	name: v.pipe(v.string(), v.minLength(3)),
	email: v.pipe(v.string(), v.email()),
	phone: v.optional(v.string()),
	password: v.pipe(v.string(), v.minLength(6)),
	role: v.optional(v.string()),
});

export const updateUserValidator = v.object({
	name: v.optional(v.pipe(v.string(), v.minLength(3))),
	email: v.optional(v.pipe(v.string(), v.email())),
	phone: v.optional(v.string()),
	role: v.optional(v.string()),
	isActive: v.optional(v.boolean()),
	password: v.optional(v.pipe(v.string(), v.minLength(6))),
});

// Response Schemas
export const userResponseSchema = v.object({
	id: v.number(),
	name: v.string(),
	email: v.string(),
	phone: v.optional(v.nullable(v.string())),
	role: v.optional(v.nullable(v.string())),
	isActive: v.optional(v.nullable(v.boolean())),
});

export const paginationMetaSchema = v.object({
	limit: v.number(),
	page: v.number(),
	total: v.number(),
});

export const userListResponseSchema = v.object({
	message: v.string(),
	data: v.array(userResponseSchema),
	meta: paginationMetaSchema,
});

// OpenAPI Route Descriptions
export const getAllUsersRouteSchema = describeRoute({
	tags: ["Users"],
	summary: "Get All Users",
	description: "Retrieve all users with pagination (admin only, requires user.view permission)",
	responses: {
		200: {
			description: "List of users",
			content: {
				"application/json": { schema: resolver(userListResponseSchema) },
			},
		},
		401: { description: "Unauthorized" },
		403: { description: "Forbidden - missing permission" },
	},
});

export const createUserRouteSchema = describeRoute({
	tags: ["Users"],
	summary: "Create User",
	description: "Create a new user (admin only)",
	responses: {
		201: {
			description: "User created successfully",
			content: {
				"application/json": {
					schema: resolver(v.object({ message: v.string() })),
				},
			},
		},
		400: { description: "Validation error" },
		401: { description: "Unauthorized" },
	},
});

export const getUserByIdRouteSchema = describeRoute({
	tags: ["Users"],
	summary: "Get User by ID",
	description: "Retrieve a single user by ID (admin only, requires user.view permission)",
	responses: {
		200: {
			description: "User details",
			content: {
				"application/json": {
					schema: resolver(v.object({
						message: v.string(),
						data: userResponseSchema,
					})),
				},
			},
		},
		401: { description: "Unauthorized" },
		403: { description: "Forbidden - missing permission" },
		404: { description: "User not found" },
	},
});

export const updateUserRouteSchema = describeRoute({
	tags: ["Users"],
	summary: "Update User",
	description: "Update an existing user (admin only)",
	responses: {
		200: {
			description: "User updated successfully",
			content: {
				"application/json": {
					schema: resolver(v.object({ message: v.string() })),
				},
			},
		},
		400: { description: "Validation error" },
		401: { description: "Unauthorized" },
		404: { description: "User not found" },
	},
});

export const deleteUserRouteSchema = describeRoute({
	tags: ["Users"],
	summary: "Delete User",
	description: "Delete a user (admin only)",
	responses: {
		200: {
			description: "User deleted successfully",
			content: {
				"application/json": {
					schema: resolver(v.object({ message: v.string() })),
				},
			},
		},
		401: { description: "Unauthorized" },
		404: { description: "User not found" },
	},
});
