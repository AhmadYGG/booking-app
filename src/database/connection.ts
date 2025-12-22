import "dotenv/config";
import { drizzle } from "drizzle-orm/bun-sql";
import type { ReturnTypeOrValue } from "drizzle-orm";
import { SQL } from "bun";

import * as schema from "./schema";

export const pool = new SQL({
	host: process.env.DB_HOST!,
	username: process.env.DB_USER!,
	database: process.env.DB_NAME!,
	password: process.env.DB_PASSWORD!,
	max: 50,
	maxLifetime: 60,
});

export const db = drizzle({ client: pool, schema });
export type DB = typeof db;
