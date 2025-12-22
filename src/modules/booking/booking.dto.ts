import * as v from "valibot";

export const createBookingValidator = v.object({
    customerId: v.pipe(v.number()),
    serviceId: v.pipe(v.number()),
    bookingDate: v.pipe(v.string(), v.regex(/^\d{4}-\d{2}-\d{2}$/)),
    startTime: v.pipe(v.string(), v.regex(/^\d{2}:\d{2}$/)),
    notes: v.optional(v.string()),
});

export type CreateBookingDTO = v.InferOutput<typeof createBookingValidator>;

export const updateBookingStatusValidator = v.object({
    status: v.pipe(v.string(), v.picklist(['pending', 'confirmed', 'completed', 'cancelled'])),
});

export type UpdateBookingStatusDTO = v.InferOutput<typeof updateBookingStatusValidator>;
