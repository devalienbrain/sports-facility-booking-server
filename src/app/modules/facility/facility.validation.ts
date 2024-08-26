import { z } from "zod";

const createFacilityValidationSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: "Name is required" })
      .min(1, "Name cannot be empty"),
    description: z
      .string({ required_error: "Description is required" })
      .min(1, "Description cannot be empty"),
    pricePerHour: z
      .number({ required_error: "Price per hour is required" })
      .positive("Price per hour must be a positive number"),
    location: z
      .string({ required_error: "Location is required" })
      .min(1, "Location cannot be empty"),
    isDeleted: z.boolean().optional(),
  }),
});

const updateFacilityValidationSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    pricePerHour: z
      .number()
      .positive("Price per hour must be a positive number")
      .optional(),
    location: z.string().optional(),
    isDeleted: z.boolean().optional(),
  }),
});

export const FacilityValidation = {
  createFacilityValidationSchema,
  updateFacilityValidationSchema,
};
