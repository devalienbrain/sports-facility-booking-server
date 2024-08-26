import { ObjectId } from "mongoose";
import { Facility } from "../facility/facility.model";

import { TBooking } from "./booking.interface";
import { Booking } from "./booking.model";

const checkAvailability = async (date: string) => {
  const bookings = await Booking.find({
    date: new Date(date),
    isBooked: "confirmed",
  });
  // Assuming full day availability from 8 AM to 10 PM
  const timeSlots = [
    { startTime: "08:00", endTime: "10:00" },
    { startTime: "10:00", endTime: "12:00" },
    { startTime: "12:00", endTime: "14:00" },
    { startTime: "14:00", endTime: "16:00" },
    { startTime: "16:00", endTime: "18:00" },
    { startTime: "18:00", endTime: "20:00" },
    { startTime: "20:00", endTime: "22:00" },
  ];

  bookings.forEach((booking) => {
    timeSlots.forEach((slot) => {
      if (
        (new Date(`1970-01-01T${slot.startTime}:00.000Z`) <=
          booking.startTime &&
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

const createBooking = async (payload: Partial<TBooking>): Promise<TBooking> => {
  // console.log(payload);
  const { startTime, endTime, facility } = payload;

  // Validate and convert startTime and endTime to Date objects
  const startTimeDate = new Date(`${payload.date}T${startTime}:00.000Z`);
  const endTimeDate = new Date(`${payload.date}T${endTime}:00.000Z`);

  if (isNaN(startTimeDate.getTime()) || isNaN(endTimeDate.getTime())) {
    throw new Error("Invalid start time or end time");
  }

  // Fetch the facility document
  const facilityDoc = await Facility.findById(facility);
  if (!facilityDoc) {
    throw new Error("Facility not found");
  }

  // Calculate the payable amount
  const duration =
    (endTimeDate.getTime() - startTimeDate.getTime()) / (1000 * 60 * 60);
  const payableAmount = duration * facilityDoc.pricePerHour;

  // Create the booking document
  const booking = new Booking({
    ...payload,
    startTime: startTimeDate,
    endTime: endTimeDate,
    payableAmount,
    isBooked: "confirmed",
  });

  // Save the booking document
  await booking.save();
  return booking;
};

const getAllBookings = async (): Promise<TBooking[]> => {
  return await Booking.find().populate("user").populate("facility");
};

const getUserBookings = async (userId: ObjectId): Promise<TBooking[]> => {
  return await Booking.find({ user: userId }).populate("facility");
};

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
