import { Request, Response, NextFunction } from "express";
import { BookingService } from "./booking.service";
import catchAsync from "../../utils/catchAsync";
import { ObjectId } from "mongoose";

// Check availability controller
export const checkAvailability = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const dateString = req.query.date as string;
    let date: Date;
    
    if (dateString) {
      // Extract day, month, and year and format date to YYYY-MM-DD
      const [day, month, year] = dateString.split("-").map(Number);
      const formattedDate = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      date = new Date(formattedDate);
    } else {
      date = new Date();
    }
    console.log(req.query, dateString, date);
    if (isNaN(date.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format. Please use DD-MM-YYYY format.",
      });
    }

    const availableSlots = await BookingService.checkAvailability(
      date.toISOString().split("T")[0]
    );
    res.status(200).json({
      success: true,
      message: "Availability checked successfully",
      data: availableSlots,
    });
  }
);

// Create booking controller
export const createBooking = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.user!;
    const bookingData = { ...req.body, user: userId };
    const booking = await BookingService.createBooking(bookingData);
    res.status(200).json({
      success: true,
      message: "Booking created successfully",
      data: booking,
    });
  }
);

// Get all bookings for admin
export const getAllBookings = catchAsync(
  async (req: Request, res: Response) => {
    const bookings = await BookingService.getAllBookings();
    res.status(200).json({
      success: true,
      message: "Bookings retrieved successfully",
      data: bookings,
    });
  }
);

// Get user-specific bookings
export const getUserBookings = catchAsync(
  async (req: Request, res: Response) => {
    const { userId} = req.params;
    // console.log(userId);
    const bookings = await BookingService.getUserBookings(userId);
    res.status(200).json({
      success: true,
      message: "User bookings retrieved successfully",
      data: bookings,
    });
  }
);



// Cancel booking
export const cancelBooking = catchAsync(async (req: Request, res: Response) => {
  const booking = await BookingService.cancelBooking(req.params.id);
  res.status(200).json({
    success: true,
    message: "Booking canceled successfully",
    data: booking,
  });
});
