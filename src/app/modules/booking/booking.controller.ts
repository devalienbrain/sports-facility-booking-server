import { Request, Response, NextFunction } from "express";
import { BookingService } from "./booking.service";
import catchAsync from "../../utils/catchAsync";

export const checkAvailability = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dateString = req.query.date as string;
      let date: Date;

      if (dateString) {
        // Extract day, month, and year
        const [day, month, year] = dateString.split("-").map(Number);
        // Format to YYYY-MM-DD
        const formattedDate = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        date = new Date(formattedDate);
      } else {
        date = new Date();
      }

      console.log({ date });

      if (isNaN(date.getTime())) {
        throw new Error("Invalid date format. Please use DD-MM-YYYY format.");
      }

      const availableSlots = await BookingService.checkAvailability(
        date.toISOString().split("T")[0]
      );
      res.status(200).json({
        success: true,
        statusCode: 200,
        message: "Availability checked successfully",
        data: availableSlots,
      });
    } catch (error) {
      next(error);
    }
  }
);

export const createBooking = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.user!;
    const bookingData = { ...req.body, user: userId };
    const booking = await BookingService.createBooking(bookingData);
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Booking created successfully",
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllBookings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const bookings = await BookingService.getAllBookings();
    if (bookings.length === 0) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: "No Data Found",
        data: [],
      });
    }
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Bookings retrieved successfully",
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserBookings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.user!;
    const bookings = await BookingService.getUserBookings(userId);
    if (bookings.length === 0) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: "No Data Found",
        data: [],
      });
    }
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "User bookings retrieved successfully",
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

export const cancelBooking = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const booking = await BookingService.cancelBooking(req.params.id);
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Booking canceled successfully",
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};
