import * as v from "valibot";
import { describeRoute, resolver } from "hono-openapi";

// Request Schemas
export const createPaymentValidator = v.object({
    bookingId: v.pipe(v.number()),
    paymentMethod: v.pipe(v.string(), v.minLength(1)),
    paymentType: v.pipe(v.string(), v.minLength(1)),
    amount: v.pipe(v.number(), v.minValue(0)),
});

export type CreatePaymentDTO = v.InferOutput<typeof createPaymentValidator>;

// Response Schemas
export const paymentResponseSchema = v.object({
    id: v.number(),
    bookingId: v.number(),
    paymentMethod: v.string(),
    paymentType: v.string(),
    amount: v.number(),
    createdAt: v.optional(v.nullable(v.string())),
});

export const paginationMetaSchema = v.object({
    limit: v.number(),
    page: v.number(),
    total: v.number(),
});

export const paymentListResponseSchema = v.object({
    message: v.string(),
    data: v.array(paymentResponseSchema),
    meta: paginationMetaSchema,
});

// OpenAPI Route Descriptions
export const getAllPaymentsRouteSchema = describeRoute({
    tags: ["Payments"],
    summary: "Get All Payments",
    description: "Retrieve all payments with pagination (admin only)",
    responses: {
        200: {
            description: "List of payments",
            content: {
                "application/json": { schema: resolver(paymentListResponseSchema) },
            },
        },
        401: { description: "Unauthorized" },
    },
});

export const getPaymentByIdRouteSchema = describeRoute({
    tags: ["Payments"],
    summary: "Get Payment by ID",
    description: "Retrieve a single payment by its ID (admin only)",
    responses: {
        200: {
            description: "Payment details",
            content: {
                "application/json": { schema: resolver(v.object({ data: paymentResponseSchema })) },
            },
        },
        401: { description: "Unauthorized" },
        404: { description: "Payment not found" },
    },
});

export const createPaymentRouteSchema = describeRoute({
    tags: ["Payments"],
    summary: "Create Payment",
    description: "Record a payment and confirm the booking (admin only)",
    responses: {
        201: {
            description: "Payment recorded successfully",
            content: {
                "application/json": {
                    schema: resolver(v.object({
                        data: paymentResponseSchema,
                        message: v.string(),
                    })),
                },
            },
        },
        400: { description: "Validation error" },
        401: { description: "Unauthorized" },
    },
});
