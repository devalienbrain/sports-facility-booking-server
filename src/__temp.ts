// All About Facility Starts
// facility.interface.ts

import { Document, Model } from "mongoose";

export interface TFacility extends Document {
  name: string;
  description: string;
  pricePerHour: number;
  location: string;
  isDeleted: boolean;
}

export interface FacilityModel extends Model<TFacility> {}

// facility.validation.ts
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

// facility.model.ts

import { Schema, model } from "mongoose";
import { FacilityModel, TFacility } from "./facility.interface";

const facilitySchema = new Schema<TFacility>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    pricePerHour: { type: Number, required: true },
    location: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export const Facility = model<TFacility, FacilityModel>(
  "Facility",
  facilitySchema
);


// facility.controller.ts
import { Request, Response, NextFunction } from "express";
import { FacilityService } from "./facility.service";

export const createFacility = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const facility = await FacilityService.createFacility(req.body);
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Facility added successfully",
      data: facility,
    });
  } catch (error) {
    next(error);
  }
};

export const updateFacility = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const facility = await FacilityService.updateFacility(
      req.params.id,
      req.body
    );
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Facility updated successfully",
      data: facility,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteFacility = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const facility = await FacilityService.deleteFacility(req.params.id);
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Facility deleted successfully",
      data: facility,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllFacilities = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const facilities = await FacilityService.getAllFacilities();
    if (facilities.length === 0) {
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
      message: "Facilities retrieved successfully",
      data: facilities,
    });
  } catch (error) {
    next(error);
  }
};


// facility.service.ts
import { TFacility } from "./facility.interface";
import { Facility } from "./facility.model";

const createFacility = async (
  payload: Partial<TFacility>
): Promise<TFacility> => {
  const facility = new Facility(payload);
  await facility.save();
  return facility;
};

const updateFacility = async (
  id: string,
  payload: Partial<TFacility>
): Promise<TFacility | null> => {
  const facility = await Facility.findByIdAndUpdate(id, payload, { new: true });
  return facility;
};

const deleteFacility = async (id: string): Promise<TFacility | null> => {
  const facility = await Facility.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true }
  );
  return facility;
};

const getAllFacilities = async (): Promise<TFacility[]> => {
  return await Facility.find({ isDeleted: false });
};

export const FacilityService = {
  createFacility,
  updateFacility,
  deleteFacility,
  getAllFacilities,
};

// facility.route.ts
import { Router } from "express";
import {
  createFacility,
  deleteFacility,
  getAllFacilities,
  updateFacility,
} from "./facility.controller";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { FacilityValidation } from "./facility.validation";

const router = Router();

router.post(
  "/",
  auth("admin"),
  validateRequest(FacilityValidation.createFacilityValidationSchema),
  createFacility
);
router.put(
  "/:id",
  auth("admin"),
  validateRequest(FacilityValidation.updateFacilityValidationSchema),
  updateFacility
);
router.delete("/:id", auth("admin"), deleteFacility);
router.get("/", getAllFacilities);

export const FacilityRoutes = router;

// All About Facility Ends
// user.interface.ts
import { Model } from "mongoose";

export type TRole = "user" | "admin";

export interface TUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  role: TRole;
  address: string;
  isDeleted: boolean;
}

export interface UserModel extends Model<TUser> {
  isUserExistsByCustomEmail(email: string): Promise<TUser | null>;
  isPasswordMatched(
    plainTextPassword: string,
    hashedPassword: string
  ): Promise<boolean>;
  isJWTIssuedBeforePasswordChanged(
    passwordChangedTimestamp: Date,
    jwtIssuedTimestamp: number
  ): boolean;
  isUserExistsByCustomId(userId: string): Promise<TUser | null>;
}

// user.model.ts
/* eslint-disable @typescript-eslint/no-this-alias */
import bcrypt from "bcrypt";
import { Schema, model } from "mongoose";
import config from "../../config";
import { TRole, TUser, UserModel } from "./user.interface";

const Role: TRole[] = ["user", "admin"];

const userSchema = new Schema<TUser>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    phone: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: Role,
    },
    address: {
      type: String,
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(
      user.password,
      Number(config.bcrypt_salt_rounds)
    );
  }
  next();
});

userSchema.post("save", function (doc, next) {
  doc.password = "";
  next();
});

userSchema.statics.isUserExistsByCustomEmail = async function (email: string) {
  return await this.findOne({ email }).select("+password");
};

userSchema.statics.isPasswordMatched = async function (
  plainTextPassword,
  hashedPassword
) {
  return await bcrypt.compare(plainTextPassword, hashedPassword);
};

export const User = model<TUser, UserModel>("User", userSchema);

// user.controller.ts
import { NextFunction, Request, Response } from "express";
import { UserServices } from "./user.service";

const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userData = req.body;
    // console.log(req.body);
    // const zodParsedData = studentValidationSchema.parse(studentData);

    const result = await UserServices.createUserIntoDB(userData);

    res.status(200).json({
      statusCode: 200,
      success: true,
      message: "User registered succesfully",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const UserControllers = {
  createUser,
};


// user.service.ts
import { TUser } from "./user.interface";
import { User } from "./user.model";

const createUserIntoDB = async (userData: TUser) => {
  // create a user
  const newUser = await User.create(userData);
  return newUser;
};

export const UserServices = {
  createUserIntoDB,
};

// user.route.ts
import express from "express";
// import { UserControllers } from "./user.controller";

const router = express.Router();

// router.post("/signup", UserControllers.createUser);

export const UserRoutes = router;

// auth.interface.ts
export type TLoginUser = {
    email: string;
    password: string;
  };
  
  export type TRefreshToken = {
    refreshToken: string;
  };

//   auth.validation.ts
import { z } from "zod";

const loginValidationSchema = z.object({
  body: z.object({
    email: z.string({ required_error: "Email is required." }),
    password: z.string({ required_error: "Password is required" }),
  }),
});

const changePasswordValidationSchema = z.object({
  body: z.object({
    oldPassword: z.string({
      required_error: "Old password is required",
    }),
    newPassword: z.string({ required_error: "Password is required" }),
  }),
});

const refreshTokenValidationSchema = z.object({
  cookies: z.object({
    refreshToken: z.string({
      required_error: "Refresh token is required!",
    }),
  }),
});

export const AuthValidation = {
  loginValidationSchema,
  changePasswordValidationSchema,
  refreshTokenValidationSchema,
};

// auth.utils.ts
import jwt from "jsonwebtoken";

export const createToken = (
  jwtPayload: { email: string; role: string },
  secret: string,
  expiresIn: string
) => {
  return jwt.sign(jwtPayload, secret, { expiresIn });
};

// auth.controller.ts
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { AuthServices } from "./auth.service";

const loginUser = catchAsync(async (req, res) => {
  // console.log(req.body);
  const result = await AuthServices.loginUser(req.body);
  const { accessToken, refreshToken, user } = result;
  // console.log({ accessToken });
  const { _id, name, email, role, phone, address } = user;
  res.cookie("refreshToken", refreshToken, {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  });
  res.status(200).json({
    statusCode: 200,
    success: true,
    token: accessToken,
    message: "User logged in Successfully!",
    data: { _id, name, email, role, phone, address },
  });
});

const refreshToken = catchAsync(async (req, res) => {
  const result = await AuthServices.refreshToken(req.cookies.refreshToken);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Access token retrieved successfully!",
    data: result,
  });
});

export const AuthControllers = {
  loginUser,
  refreshToken,
};


// auth.service.ts
import { TUser } from "./user.interface";
import { User } from "./user.model";

const createUserIntoDB = async (userData: TUser) => {
  // create a user
  const newUser = await User.create(userData);
  return newUser;
};

export const UserServices = {
  createUserIntoDB,
};

// middleware/auth.ts
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../config";
import AppError from "../errors/AppError";
import { TRole } from "../modules/user/user.interface";
import { User } from "../modules/user/user.model";
import catchAsync from "../utils/catchAsync";

const auth = (...requiredRoles: TRole[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const bearerToken = req.headers.authorization;
    console.log({ bearerToken });
    const splitToken = bearerToken?.split(" ");
    
    console.log({ splitToken });
    const token = splitToken ? splitToken[1] : null;
    console.log({ token });
    
    // checking if the token is missing
    if (!token) {
      return res.status(httpStatus.UNAUTHORIZED).json({
        success: false,
        statusCode: 401,
        message: "You have no access to this route",
      });
    }

    // checking if the given token is valid
    const decoded = jwt.verify(
      token,
      config.jwt_access_secret as string
    ) as JwtPayload;

    const { role, email } = decoded;
    // console.log(decoded);
    // checking if the user is exist
    const user = await User.isUserExistsByCustomEmail(email);

    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, "This user is not found !");
    }
    // checking if the user is already deleted

    const isDeleted = user?.isDeleted;

    if (isDeleted) {
      throw new AppError(httpStatus.FORBIDDEN, "This user is deleted !");
    }

    if (requiredRoles && !requiredRoles.includes(role)) {
      return res.status(httpStatus.UNAUTHORIZED).json({
        success: false,
        statusCode: 401,
        message: "You have no access to this route",
      });
    }

    req.user = decoded as JwtPayload;
    // console.log(req.user);
    next();
  });
};

export default auth;


// routes/index.ts
import { Router } from "express";
import { UserRoutes } from "../modules/user/user.route";
import { AuthRoutes } from "../modules/auth/auth.route";
import { FacilityRoutes } from "../modules/facility/facility.route";
import { BookingRoutes } from "../modules/booking/booking.route";
import { BookingAvailabilityCheckRoutes } from "../modules/booking/bookingAvailability.route";

const router = Router();

const moduleRoutes = [
  {
    path: "/users",
    route: UserRoutes,
  },
  {
    path: "/facility",
    route: FacilityRoutes,
  },
  {
    path: "/bookings",
    route: BookingRoutes,
  },
  {
    path: "/check-availability",
    route: BookingAvailabilityCheckRoutes,
  },
  {
    path: "/auth",
    route: AuthRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;


// All About Booking Starts
// booking.interface.ts
import { Document, Model, Types } from "mongoose";
import { TUser } from "../user/user.interface";
import { TFacility } from "../facility/facility.interface";

export interface TBooking extends Document {
  date: Date;
  startTime: Date;
  endTime: Date;
  user: Types.ObjectId | TUser;
  facility: Types.ObjectId | TFacility;
  payableAmount: number;
  isBooked: "confirmed" | "unconfirmed" | "canceled";
}

export interface BookingModel extends Model<TBooking> {}
// Booking.model.ts
import { Schema, model } from "mongoose";
import { BookingModel, TBooking } from "./booking.interface";

const bookingSchema = new Schema<TBooking>(
  {
    date: { type: Date, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    facility: { type: Schema.Types.ObjectId, ref: "Facility", required: true },
    payableAmount: { type: Number, required: true },
    isBooked: {
      type: String,
      enum: ["confirmed", "unconfirmed", "canceled"],
      default: "unconfirmed",
    },
  },
  {
    timestamps: true,
  }
);

export const Booking = model<TBooking, BookingModel>("Booking", bookingSchema);
// booking.route.ts
import { Router } from "express";
import {
  cancelBooking,
  createBooking,
  getAllBookings,
  getUserBookings,
} from "./booking.controller";
import auth from "../../middlewares/auth";

const router = Router();

router.post("/", auth("user"), createBooking);
router.get("/", auth("admin"), getAllBookings);
router.get("/user", auth("user"), getUserBookings);
router.delete("/:id", auth("user"), cancelBooking);

export const BookingRoutes = router;
// booking.service.ts
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
// booking.controller.ts
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
// bookingAvailability.route.ts
import { Router } from "express";
import { checkAvailability } from "./booking.controller";

const router = Router();

router.get("/", checkAvailability);

export const BookingAvailabilityCheckRoutes = router;

// All About Booking Ends