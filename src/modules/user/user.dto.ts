import { users } from "../../database/schema/users";
import * as v from "valibot";

export type CreateUserDTO = typeof users.$inferInsert; // typeof users.$inferInsert;
export type UpdateUserDTO = {
	fullName: string;
	email: string;
	phone: string;
	positionID: number;
	username: string;
};

export const createUserValidator = v.object({
	fullName: v.string(),
	email: v.string(),
	phone: v.string(),
	positionID: v.number(),
	username: v.string(),
	password: v.string(),
});

export const updateUserValidator = v.object({
	fullName: v.string(),
	email: v.string(),
	phone: v.string(),
	positionID: v.number(),
	username: v.string(),
});
