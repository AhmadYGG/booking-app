import { users } from "../../database/schema/users";
import * as v from "valibot";

export type CreateUserDTO = typeof users.$inferInsert;
export type UpdateUserDTO = {
	name: string;
	email: string;
	phone?: string;
	role?: string;
	isActive?: boolean;
};

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
});
