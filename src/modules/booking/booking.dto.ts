import * as v from "valibot";
import { describeRoute, resolver } from "hono-openapi";

// Request Schemas
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

// Response Schemas
export const bookingResponseSchema = v.object({
    id: v.number(),
    customerId: v.number(),
    serviceId: v.number(),
    bookingDate: v.string(),
    startTime: v.string(),
    status: v.string(),
    notes: v.optional(v.nullable(v.string())),
});

export const paginationMetaSchema = v.object({
    limit: v.number(),
    page: v.number(),
    total: v.number(),
});

export const bookingListResponseSchema = v.object({
    message: v.string(),
    data: v.array(bookingResponseSchema),
    meta: paginationMetaSchema,
});

// OpenAPI Route Descriptions
export const getAllBookingsRouteSchema = describeRoute({
    tags: ["Bookings"],
    summary: "Get All Bookings",
    description: "Retrieve all bookings with pagination (admin only)",
    responses: {
        200: {
            description: "List of bookings",
            content: {
                "application/json": { schema: resolver(bookingListResponseSchema) },
            },
        },
        401: { description: "Unauthorized" },
    },
});

export const getBookingByIdRouteSchema = describeRoute({
    tags: ["Bookings"],
    summary: "Get Booking by ID",
    description: "Retrieve a single booking by its ID (admin only)",
    responses: {
        200: {
            description: "Booking details",
            content: {
                "application/json": { schema: resolver(v.object({ data: bookingResponseSchema })) },
            },
        },
        401: { description: "Unauthorized" },
        404: { description: "Booking not found" },
    },
});

export const getCustomerHistoryRouteSchema = describeRoute({
    tags: ["Bookings"],
    summary: "Get Customer Booking History",
    description: "Retrieve booking history for a specific customer",
    responses: {
        200: {
            description: "Customer booking history",
            content: {
                "application/json": { schema: resolver(v.object({ data: v.array(bookingResponseSchema) })) },
            },
        },
        401: { description: "Unauthorized" },
    },
});

export const createBookingRouteSchema = describeRoute({
    tags: ["Bookings"],
    summary: "Create Booking",
    description: "Create a new booking",
    responses: {
        201: {
            description: "Booking created successfully",
            content: {
                "application/json": {
                    schema: resolver(v.object({
                        data: bookingResponseSchema,
                        message: v.string(),
                    })),
                },
            },
        },
        400: { description: "Validation error" },
        401: { description: "Unauthorized" },
    },
});

export const updateBookingStatusRouteSchema = describeRoute({
    tags: ["Bookings"],
    summary: "Update Booking Status",
    description: "Update the status of an existing booking (admin only)",
    responses: {
        200: {
            description: "Booking status updated",
            content: {
                "application/json": {
                    schema: resolver(v.object({
                        data: bookingResponseSchema,
                        message: v.string(),
                    })),
                },
            },
        },
        400: { description: "Validation error" },
        401: { description: "Unauthorized" },
        404: { description: "Booking not found" },
    },
});
