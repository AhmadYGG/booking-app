import { eq, count } from "drizzle-orm";
import { DB } from "../../database/connection";
import { payments } from "../../database/schema/payments";
import { bookings } from "../../database/schema/bookings";

export class PaymentRepository {
    constructor(private db: DB) { }

    async find(page: number = 1, limit: number = 10) {
        const offset = (page - 1) * limit;
        const [data, totalRows] = await Promise.all([
            this.db.query.payments.findMany({
                with: {
                    booking: true,
                },
                limit,
                offset,
                orderBy: (payments, { desc }) => [desc(payments.createdAt)],
            }),
            this.db.select({ count: count() }).from(payments),
        ]);

        return { data, page, limit, total: totalRows[0].count };
    }

    async findByID(id: number) {
        return await this.db.query.payments.findFirst({
            where: eq(payments.id, id),
            with: {
                booking: true,
            },
        });
    }

    async create(data: typeof payments.$inferInsert) {
        return await this.db.transaction(async (tx) => {
            const [payment] = await tx.insert(payments).values(data).returning();

            // Per flowchart: Update booking status after payment
            await tx.update(bookings)
                .set({ status: 'confirmed', updatedAt: new Date() })
                .where(eq(bookings.id, data.bookingId!));

            return payment;
        });
    }
}
