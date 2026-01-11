import "dotenv/config";
import { eq } from "drizzle-orm";
import type { DB } from "../../database/connection";
import { users } from "../../database/schema/users";
import { refreshTokens } from "../../database/schema/refreshTokens";

export class AuthRepository {
    constructor(private readonly db: DB) { }

    async findUserByEmail(email: string) {
        const [user] = await this.db
            .select()
            .from(users)
            .where(eq(users.email, email));
        return user;
    }

    async findUserById(id: number) {
        const [user] = await this.db.select().from(users).where(eq(users.id, id));
        return user;
    }

    async deleteToken(token: string) {
        await this.db
            .delete(refreshTokens)
            .where(eq(refreshTokens.token, token));
    }
}
