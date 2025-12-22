import * as v from "valibot";

export const CreateServiceSchema = v.object({
    serviceName: v.pipe(v.string(), v.minLength(3, "Service name must be at least 3 characters")),
    durationMinutes: v.pipe(v.number(), v.minValue(1, "Duration must be at least 1 minute")),
    price: v.pipe(v.number(), v.minValue(0, "Price cannot be negative")),
    description: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
});

export const UpdateServiceSchema = v.partial(CreateServiceSchema);

export const ToggleServiceStatusSchema = v.object({
    isActive: v.boolean(),
});

export type CreateServiceDTO = v.InferOutput<typeof CreateServiceSchema>;
export type UpdateServiceDTO = v.InferOutput<typeof UpdateServiceSchema>;
export type ToggleServiceStatusDTO = v.InferOutput<typeof ToggleServiceStatusSchema>;
