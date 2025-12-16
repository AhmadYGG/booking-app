import { eq, and } from "drizzle-orm";
import { DB } from "../../database/connection";
import { refreshTokens } from "../../database/schema/refreshTokens";
import { CreateRefreshTokenDTO } from "./auth.dto";

export class AuthRepository {
  constructor(private db: DB) {}

  async findByUserAgentAndUsername(userAgent: string, username: string) {
    const token = await this.db
      .select()
      .from(refreshTokens)
      .where(
        and(
          eq(refreshTokens.userAgent, userAgent),
          eq(refreshTokens.username, username),
        ),
      )
      .limit(1);
    if (token.length === 0) {
      return null;
    }
    return token[0];
  }

  async creteRefreshToken(data: CreateRefreshTokenDTO) {
    await this.db
      .insert(refreshTokens)
      .values(data)
      .onConflictDoUpdate({
        target: refreshTokens.userAgent,
        set: {
          username: data.username,
          token: data.token,
        },
      });
  }

  async delete(userAgent: string) {
    await this.db
      .delete(refreshTokens)
      .where(eq(refreshTokens.userAgent, userAgent));
  }
}
