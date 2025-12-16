import "dotenv/config";
import { drizzle } from "drizzle-orm/bun-sql";
import type { ReturnTypeOrValue } from "drizzle-orm";
import { SQL } from "bun";

export const pool = new SQL({
	host: process.env.DB_HOST!,
	username: process.env.postgres!,
	database: process.env.postgres!,
	password: process.env.postgres!,
	max: 50,
	maxLifetime: 60,
});

export const db = drizzle({ client: pool });
export type DB = ReturnTypeOrValue<typeof db>;
