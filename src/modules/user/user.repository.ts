import { count, eq } from "drizzle-orm";
import { DB } from "../../database/connection";
import { users } from "../../database/schema/users";
import { CreateUserDTO } from "./user.dto";
import { password } from "bun";

export class UserRepository {
	constructor(private db: DB) {}

	async find(page: number = 1, limit: number = 10) {
		const offset = (page - 1) * limit;
		const [data, totalRows] = await Promise.all([
			this.db
				.select({
					id: users.id,
					name: users.name,
					email: users.email,
					phone: users.phone,
					role: users.role,
					isActive: users.isActive,
					createdAt: users.createdAt,
				})
				.from(users)
				.limit(limit)
				.offset(offset),
			this.db.select({ count: count() }).from(users),
		]);

		return { data, page, limit, total: totalRows[0].count };
	}

	async findByEmail(email: string) {
		const user = await this.db
			.select()
			.from(users)
			.where(eq(users.email, email))
			.limit(1);

		if (user.length === 0) {
			return null;
		}
		return user[0];
	}

	async findByID(id: number) {
		const user = await this.db
			.select({
				id: users.id,
				name: users.name,
				email: users.email,
				phone: users.phone,
				role: users.role,
				isActive: users.isActive,
			})
			.from(users)
			.where(eq(users.id, id))
			.limit(1);
		if (user.length === 0) {
			return null;
		}
		return user[0];
	}

	async save(data: CreateUserDTO) {
		const hashed = await password.hash(data.password!);
		data.password = hashed;
		return await this.db.insert(users).values(data).returning();
	}

	async update(id: number, data: Partial<typeof users.$inferInsert>) {
		if (data.password) {
			data.password = await password.hash(data.password);
		}
		return await this.db.update(users).set(data).where(eq(users.id, id)).returning();
	}

	async delete(id: number) {
		return await this.db.delete(users).where(eq(users.id, id)).returning();
	}

	async findByUsername(name: string) {
		// In the current schema, 'name' is used instead of 'username'
		const user = await this.db
			.select()
			.from(users)
			.where(eq(users.name, name))
			.limit(1);

		if (user.length === 0) {
			return null;
		}
		return user[0];
	}
}
