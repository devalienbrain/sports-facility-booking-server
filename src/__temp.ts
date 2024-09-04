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
