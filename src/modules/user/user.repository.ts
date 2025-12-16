import { and, count, eq, exists, not, sql } from "drizzle-orm";
import { DB } from "../../database/connection";
import { users } from "../../database/schema/users";
import { positions } from "../../database/schema/positions";
import { CreateUserDTO } from "./user.dto";
import { password } from "bun";
import { attendances } from "../../database/schema/attendances";
import { leaveRequests } from "../../database/schema/leaveRequest";

const getCurrentDateString = (): string => {
	const today = new Date();
	const yyyy = today.getFullYear();
	const mm = String(today.getMonth() + 1).padStart(2, "0");
	const dd = String(today.getDate()).padStart(2, "0");
	return `${yyyy}-${mm}-${dd}`;
};

export class UserRepository {
	constructor(private db: DB) {}

	async find(page: number = 1, limit: number = 10) {
		const offset = (page - 1) * limit;
		const [data, totalRows] = await Promise.all([
			this.db
				.select({
					id: users.id,
					fullName: users.fullName,
					email: users.email,
					phone: users.phone,
					username: users.username,
					role: users.role,
					position: positions.name,
				})
				.from(users)
				.leftJoin(positions, eq(users.positionID, positions.id))
				.limit(limit)
				.offset(offset),
			this.db.select({ count: count() }).from(users),
		]);

		return { data, page, limit, total: totalRows[0].count };
	}

	async findByUsername(username: string) {
		const user = await this.db
			.select({
				id: users.id,
				username: users.username,
				password: users.password,
				role: users.role,
				position: positions.name,
			})
			.from(users)
			.innerJoin(positions, eq(users.positionID, positions.id))
			.where(eq(users.username, username))
			.limit(1);

		if (user.length === 0) {
			console.log("user not found");
			return null;
		}
		return user[0];
	}

	async findByID(id: number) {
		const user = await this.db
			.select({
				id: users.id,
				username: users.username,
				role: users.role,
				position: positions.name,
			})
			.from(users)
			.innerJoin(positions, eq(users.positionID, positions.id))
			.where(eq(users.id, id))
			.limit(1);
		if (user.length === 0) {
			console.log("user not found");
			return null;
		}
		return user[0];
	}

	async save(data: CreateUserDTO) {
		const hashed = await password.hash(data.password);
		data.password = hashed;
		(data as any).role = "karyawan";
		return await this.db.insert(users).values(data).returning();
	}

	async saveSuperadmin(data: CreateUserDTO) {
		const hashed = await password.hash(data.password);
		data.password = hashed;
		(data as any).role = "superadmin";
		return await this.db.insert(users).values(data).returning();
	}

	async update(id: number, data: Partial<typeof users.$inferInsert>) {
		return await this.db.update(users).set(data).where(eq(users.id, id));
	}

	async delete(id: number) {
		return await this.db.delete(users).where(eq(users.id, id));
	}

	async countEmployees() {
		const result = await this.db
			.select({
				totalEmployees: count(users.id),
			})
			.from(users)
			.where(eq(users.role, "karyawan"));

		return result[0].totalEmployees;
	}

	async findUsersNotPresentToday() {
		const today = getCurrentDateString();

		const attendedToday = this.db
			.select({ id: attendances.userID })
			.from(attendances)
			.where(
				and(eq(attendances.userID, users.id), eq(attendances.date, today)),
			);

		const onLeaveToday = this.db
			.select({ id: leaveRequests.userID })
			.from(leaveRequests)
			.where(
				and(
					eq(leaveRequests.userID, users.id),
					sql`${leaveRequests.startDate} <= ${today}`,
					sql`${leaveRequests.endDate} >= ${today}`,
				),
			);

		return this.db
			.select({
				fullName: users.fullName,
				positionName: positions.name,
			})
			.from(users)
			.innerJoin(positions, eq(users.positionID, positions.id))
			.where(
				and(
					eq(users.role, "karyawan"),
					not(exists(attendedToday)),
					not(exists(onLeaveToday)),
				),
			);
	}
}
