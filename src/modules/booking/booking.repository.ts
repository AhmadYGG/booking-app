import { and, eq, gte, lte, or, count, between } from "drizzle-orm";
import { DB } from "../../database/connection";
import { bookings } from "../../database/schema/bookings";
import { services } from "../../database/schema/services";
import { customers } from "../../database/schema/customers";
import { schedules } from "../../database/schema/schedules";

export class BookingRepository {
    constructor(private db: DB) { }

    async find(page: number = 1, limit: number = 10) {
        const offset = (page - 1) * limit;
        const [data, totalRows] = await Promise.all([
            this.db.query.bookings.findMany({
                with: {
                    customer: true,
                    service: true,
                },
                limit,
                offset,
                orderBy: (bookings, { desc }) => [desc(bookings.createdAt)],
            }),
            this.db.select({ count: count() }).from(bookings),
        ]);

        return { data, page, limit, total: totalRows[0].count };
    }

    async findByID(id: number) {
        return await this.db.query.bookings.findFirst({
            where: eq(bookings.id, id),
            with: {
                customer: true,
                service: true,
            },
        });
    }

    async findOverlapping(date: string, startTime: string, endTime: string) {
        // Logic: A booking overlaps if:
        // (NewStart < ExistingEnd) AND (NewEnd > ExistingStart)
        // We only check for 'confirmed' or 'pending' bookings, but per flowchart we check existence.
        return await this.db.select()
            .from(bookings)
            .where(
                and(
                    eq(bookings.bookingDate, date),
                    or(
                        eq(bookings.status, 'pending'),
                        eq(bookings.status, 'confirmed')
                    ),
                    and(
                        lte(bookings.startTime, endTime),
                        gte(bookings.endTime, startTime)
                    )
                )
            );
    }

    async getScheduleByDay(dayOfWeek: number) {
        return await this.db.select()
            .from(schedules)
            .where(eq(schedules.dayOfWeek, dayOfWeek))
            .limit(1);
    }

    async getServiceByID(id: number) {
        return await this.db.select()
            .from(services)
            .where(eq(services.id, id))
            .limit(1);
    }

    async create(data: typeof bookings.$inferInsert) {
        return await this.db.insert(bookings).values(data).returning();
    }

    async updateStatus(id: number, status: string) {
        return await this.db.update(bookings)
            .set({ status: status as any, updatedAt: new Date() })
            .where(eq(bookings.id, id))
            .returning();
    }
}
