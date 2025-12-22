import * as v from "valibot";

export const createPaymentValidator = v.object({
    bookingId: v.pipe(v.number()),
    paymentMethod: v.pipe(v.string(), v.minLength(1)),
    paymentType: v.pipe(v.string(), v.minLength(1)),
    amount: v.pipe(v.number(), v.minValue(0)),
});

export type CreatePaymentDTO = v.InferOutput<typeof createPaymentValidator>;
