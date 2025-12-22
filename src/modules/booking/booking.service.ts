import { CreateBookingDTO } from "./booking.dto";
import { BookingRepository } from "./booking.repository";

export class BookingService {
    constructor(private bookingRepo: BookingRepository) { }

    async getAll(page: number, limit: number) {
        return await this.bookingRepo.find(page, limit);
    }

    async getByID(id: number) {
        return await this.bookingRepo.findByID(id);
    }

    async create(data: CreateBookingDTO) {
        // 1. Get Service for duration
        const [service] = await this.bookingRepo.getServiceByID(data.serviceId);
        if (!service) throw new Error("Service not found");

        const duration = service.durationMinutes || 0;

        // 2. Calculate End Time
        const startParts = data.startTime.split(':').map(Number);
        const startDate = new Date(2000, 0, 1, startParts[0], startParts[1]);
        const endDate = new Date(startDate.getTime() + duration * 60000);

        const endTimeStr = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;

        // 3. Check Shop Schedule
        const bookingDate = new Date(data.bookingDate);
        const dayOfWeek = bookingDate.getDay(); // 0 = Sunday, etc.

        const [schedule] = await this.bookingRepo.getScheduleByDay(dayOfWeek);
        if (!schedule || !schedule.isOpen) {
            throw new Error("Shop is closed on this day");
        }

        if (data.startTime < schedule.openTime! || endTimeStr > schedule.closeTime!) {
            throw new Error(`Shop is only open between ${schedule.openTime} and ${schedule.closeTime}`);
        }

        // 4. Check Overlaps
        const overlaps = await this.bookingRepo.findOverlapping(data.bookingDate, data.startTime, endTimeStr);
        if (overlaps.length > 0) {
            throw new Error("Slot not available (overlap)");
        }

        // 5. Generate Booking Code
        const bookingCode = `BK-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        // 6. Save Booking
        const [booking] = await this.bookingRepo.create({
            bookingCode,
            customerId: data.customerId,
            serviceId: data.serviceId,
            bookingDate: data.bookingDate,
            startTime: data.startTime,
            endTime: endTimeStr,
            status: 'pending',
            notes: data.notes,
        });

        return booking;
    }

    async updateStatus(id: number, status: string) {
        const [booking] = await this.bookingRepo.updateStatus(id, status);
        if (!booking) throw new Error("Booking not found");
        return booking;
    }
}
