import { ObjectId } from "mongoose";
import { Facility } from "../facility/facility.model";
import { TBooking } from "./booking.interface";
import { Booking } from "./booking.model";

// Check facility availability
const checkAvailability = async (date: string) => {
  const bookings = await Booking.find({
    date: new Date(date),
    isBooked: "confirmed",
  });

  const timeSlots = [
    { startTime: "08:00", endTime: "10:00" },
    { startTime: "10:00", endTime: "12:00" },
    { startTime: "12:00", endTime: "14:00" },
    { startTime: "14:00", endTime: "16:00" },
    { startTime: "16:00", endTime: "18:00" },
    { startTime: "18:00", endTime: "20:00" },
    { startTime: "20:00", endTime: "22:00" },
  ];

  // Remove booked slots
  bookings.forEach((booking) => {
    timeSlots.forEach((slot) => {
      if (
        (new Date(`1970-01-01T${slot.startTime}:00.000Z`) <= booking.startTime &&
          new Date(`1970-01-01T${slot.endTime}:00.000Z`) > booking.startTime) ||
        (new Date(`1970-01-01T${slot.startTime}:00.000Z`) < booking.endTime &&
          new Date(`1970-01-01T${slot.endTime}:00.000Z`) >= booking.endTime)
      ) {
        slot.startTime = "";
        slot.endTime = "";
      }
    });
  });

  return timeSlots.filter((slot) => slot.startTime && slot.endTime);
};

// Create a new booking
const createBooking = async (payload: Partial<TBooking>): Promise<TBooking> => {
  const { startTime, endTime, facility } = payload;

  const startTimeDate = new Date(`${payload.date}T${startTime}:00.000Z`);
  const endTimeDate = new Date(`${payload.date}T${endTime}:00.000Z`);

  if (isNaN(startTimeDate.getTime()) || isNaN(endTimeDate.getTime())) {
    throw new Error("Invalid start time or end time");
  }

  const facilityDoc = await Facility.findById(facility);
  if (!facilityDoc) {
    throw new Error("Facility not found");
  }

  const duration = (endTimeDate.getTime() - startTimeDate.getTime()) / (1000 * 60 * 60);
  const payableAmount = duration * facilityDoc.pricePerHour;

  const booking = new Booking({
    ...payload,
    startTime: startTimeDate,
    endTime: endTimeDate,
    payableAmount,
    isBooked: "confirmed",
  });

  await booking.save();
  return booking;
};

// Get all bookings (admin)
const getAllBookings = async (): Promise<TBooking[]> => {
  return await Booking.find().populate("user").populate("facility");
};

// Get bookings for a specific user
const getUserBookings = async (userId: ObjectId): Promise<TBooking[]> => {
  return await Booking.find({ user: userId }).populate("facility");
};

// Cancel a booking
const cancelBooking = async (id: string): Promise<TBooking | null> => {
  return await Booking.findByIdAndUpdate(
    id,
    { isBooked: "canceled" },
    { new: true }
  ).populate("user facility");
};

export const BookingService = {
  checkAvailability,
  createBooking,
  getAllBookings,
  getUserBookings,
  cancelBooking,
};
