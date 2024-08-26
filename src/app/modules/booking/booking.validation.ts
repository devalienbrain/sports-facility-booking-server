import { z } from "zod";

const dateStringToDate = (dateString: string) => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    throw new Error("Invalid date format");
  }
  return date;
};

const createBookingValidationSchema = z.object({
  body: z.object({
    date: z
      .string({ required_error: "Date is required" })
      .transform(dateStringToDate),
    startTime: z
      .string({ required_error: "Start time is required" })
      .transform(dateStringToDate),
    endTime: z
      .string({ required_error: "End time is required" })
      .transform(dateStringToDate),
    user: z.string({ required_error: "User ID is required" }),
    facility: z.string({ required_error: "Facility ID is required" }),
    payableAmount: z
      .number({ required_error: "Payable amount is required" })
      .positive("Payable amount must be a positive number"),
    isBooked: z.enum(["confirmed", "unconfirmed", "canceled"]).optional(),
  }),
});

const updateBookingValidationSchema = z.object({
  body: z.object({
    date: z
      .string()
      .optional()
      .transform((val) => (val ? dateStringToDate(val) : undefined)),
    startTime: z
      .string()
      .optional()
      .transform((val) => (val ? dateStringToDate(val) : undefined)),
    endTime: z
      .string()
      .optional()
      .transform((val) => (val ? dateStringToDate(val) : undefined)),
    user: z.string().optional(),
    facility: z.string().optional(),
    payableAmount: z
      .number()
      .positive("Payable amount must be a positive number")
      .optional(),
    isBooked: z.enum(["confirmed", "unconfirmed", "canceled"]).optional(),
  }),
});

export const BookingValidation = {
  createBookingValidationSchema,
  updateBookingValidationSchema,
};
