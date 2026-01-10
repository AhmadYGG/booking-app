import "dotenv/config";
import { eq, and, gt, sql, lt } from "drizzle-orm";
import type { DB } from "../../database/connection";
import { users } from "../../database/schemas/users";
import { userTokens } from "../../database/schemas/user_tokens";
import { employees } from "../../database/schemas/employees";

export class AuthRepository {
    constructor(private readonly db: DB) { }

    async findUserByEmail(email: string) {
        const [user] = await this.db
            .select()
            .from(users)
            .where(eq(users.email, email));
        return user;
    }

    // async findUserByUserAgent(userAgent: string, userID: number) {
    // 	const [user] = await this.db
    // 		.select()
    // 		.from(userTokens)
    // 		.where(
    // 			and(eq(userTokens.userAgent, userAgent), eq(userTokens.userId, userID)),
    // 		);
    // 	return user;
    // }

    async findUserByAccessToken(accessToken: string) {
        const [user] = await this.db
            .select()
            .from(userTokens)
            .where(and(eq(userTokens.accessToken, accessToken)));
        return user;
    }

    async findEmployeeByEmail(email: string) {
        const [employee] = await this.db
            .select()
            .from(employees)
            .where(eq(employees.email, email));

        return employee;
    }

    async findUserById(id: number) {
        const [user] = await this.db.select().from(users).where(eq(users.id, id));
        return user;
    }

    async findEmployeeById(id: number) {
        const [employee] = await this.db
            .select()
            .from(employees)
            .where(eq(employees.id, id));
        return employee;
    }

    async createSaveToken(data: typeof userTokens.$inferInsert) {
        // Drizzle upsert with conflict on unique constraint
        await this.db.insert(userTokens).values(data);
        // .onConflictDoUpdate({
        // 	set: {
        // 		userId: data.userId,
        // 		role: data.role,
        // 		refreshToken: data.refreshToken,
        // 		expiresAt: data.expiresAt,
        // 		updatedAt: new Date(),
        // 	},
        // });
    }

    async renewAccessTokenToRefreshToken(
        accessToken: string,
        refreshToken: string,
    ) {
        await this.db
            .update(userTokens)
            .set({
                accessToken,
            })
            .where(eq(userTokens.refreshToken, refreshToken));
    }

    async findRefreshToken(userId: number, role: string) {
        const [token] = await this.db
            .select()
            .from(userTokens)
            .where(
                and(
                    eq(userTokens.userId, userId),
                    eq(userTokens.role, role),
                    gt(userTokens.expiresAt, new Date()),
                ),
            );
        return token;
    }

    async deleteToken(accessToken: string) {
        await this.db
            .delete(userTokens)
            .where(eq(userTokens.accessToken, accessToken));
    }

    async deleteExpiredRefreshToken() {
        const now = new Date();
        const result = await this.db
            .delete(userTokens)
            .where(lt(userTokens.expiresAt, now))
            .returning({ id: userTokens.id });

        console.log(
            `[TokenCleanup] Deleted ${result.length} expired refresh tokens`,
        );

        return result.length;
    }
}
