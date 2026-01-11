import * as v from "valibot";
import { describeRoute, resolver } from "hono-openapi";

// Request Schemas
export const CreateServiceSchema = v.object({
    serviceName: v.pipe(v.string(), v.minLength(3, "Service name must be at least 3 characters")),
    durationMinutes: v.pipe(v.number(), v.minValue(1, "Duration must be at least 1 minute")),
    price: v.pipe(v.number(), v.minValue(0, "Price cannot be negative")),
    description: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
});

export const UpdateServiceSchema = v.object({
    serviceName: v.optional(v.pipe(v.string(), v.minLength(3, "Service name must be at least 3 characters"))),
    durationMinutes: v.optional(v.pipe(v.number(), v.minValue(1, "Duration must be at least 1 minute"))),
    price: v.optional(v.pipe(v.number(), v.minValue(0, "Price cannot be negative"))),
    description: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
});

export const ToggleServiceStatusSchema = v.object({
    isActive: v.boolean(),
});

export type CreateServiceDTO = v.InferOutput<typeof CreateServiceSchema>;
export type UpdateServiceDTO = v.InferOutput<typeof UpdateServiceSchema>;
export type ToggleServiceStatusDTO = v.InferOutput<typeof ToggleServiceStatusSchema>;

// Response Schemas
export const serviceResponseSchema = v.object({
    id: v.number(),
    serviceName: v.string(),
    durationMinutes: v.number(),
    price: v.number(),
    description: v.optional(v.nullable(v.string())),
    isActive: v.boolean(),
});

export const paginationMetaSchema = v.object({
    limit: v.number(),
    page: v.number(),
    total: v.number(),
});

export const serviceListResponseSchema = v.object({
    message: v.string(),
    data: v.array(serviceResponseSchema),
    meta: paginationMetaSchema,
});

// OpenAPI Route Descriptions
export const getAllServicesRouteSchema = describeRoute({
    tags: ["Services"],
    summary: "Get All Services",
    description: "Retrieve all services with pagination",
    responses: {
        200: {
            description: "List of services",
            content: {
                "application/json": { schema: resolver(serviceListResponseSchema) },
            },
        },
    },
});

export const getServiceByIdRouteSchema = describeRoute({
    tags: ["Services"],
    summary: "Get Service by ID",
    description: "Retrieve a single service by its ID",
    responses: {
        200: {
            description: "Service details",
            content: {
                "application/json": { schema: resolver(v.object({ data: serviceResponseSchema })) },
            },
        },
        404: { description: "Service not found" },
    },
});

export const createServiceRouteSchema = describeRoute({
    tags: ["Services"],
    summary: "Create Service",
    description: "Create a new service (admin only)",
    responses: {
        201: {
            description: "Service created successfully",
            content: {
                "application/json": {
                    schema: resolver(v.object({
                        message: v.string(),
                    })),
                },
            },
        },
        400: { description: "Validation error" },
        401: { description: "Unauthorized" },
    },
});

export const updateServiceRouteSchema = describeRoute({
    tags: ["Services"],
    summary: "Update Service",
    description: "Update an existing service (admin only)",
    responses: {
        200: {
            description: "Service updated successfully",
            content: {
                "application/json": {
                    schema: resolver(v.object({
                        message: v.string(),
                    })),
                },
            },
        },
        400: { description: "Validation error" },
        401: { description: "Unauthorized" },
        404: { description: "Service not found" },
    },
});

export const toggleServiceStatusRouteSchema = describeRoute({
    tags: ["Services"],
    summary: "Toggle Service Status",
    description: "Activate or deactivate a service (admin only)",
    responses: {
        200: {
            description: "Service status updated",
            content: {
                "application/json": {
                    schema: resolver(v.object({
                        message: v.string(),
                    })),
                },
            },
        },
        400: { description: "Validation error" },
        401: { description: "Unauthorized" },
        404: { description: "Service not found" },
    },
});

export const deleteServiceRouteSchema = describeRoute({
    tags: ["Services"],
    summary: "Delete Service",
    description: "Delete a service (admin only)",
    responses: {
        200: {
            description: "Service deleted successfully",
            content: {
                "application/json": {
                    schema: resolver(v.object({ message: v.string() })),
                },
            },
        },
        401: { description: "Unauthorized" },
        404: { description: "Service not found" },
    },
});
