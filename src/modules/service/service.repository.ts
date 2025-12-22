import { eq, count } from "drizzle-orm";
import { DB } from "../../database/connection";
import { services } from "../../database/schema/services";

export class ServiceRepository {
    constructor(private db: DB) { }

    async find(page: number = 1, limit: number = 10) {
        const offset = (page - 1) * limit;
        const [data, totalRows] = await Promise.all([
            this.db.query.services.findMany({
                limit,
                offset,
                orderBy: (services, { desc }) => [desc(services.createdAt)],
            }),
            this.db.select({ count: count() }).from(services),
        ]);

        return { data, page, limit, total: totalRows[0].count };
    }

    async findByID(id: number) {
        return await this.db.query.services.findFirst({
            where: eq(services.id, id),
        });
    }

    async create(data: typeof services.$inferInsert) {
        return await this.db.insert(services).values(data).returning();
    }

    async update(id: number, data: Partial<typeof services.$inferInsert>) {
        return await this.db.update(services)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(services.id, id))
            .returning();
    }

    async delete(id: number) {
        return await this.db.delete(services).where(eq(services.id, id)).returning();
    }

    async updateStatus(id: number, isActive: boolean) {
        return await this.db.update(services)
            .set({ isActive, updatedAt: new Date() })
            .where(eq(services.id, id))
            .returning();
    }
}
