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
