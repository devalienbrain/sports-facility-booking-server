import { Document, Model } from "mongoose";

export interface TFacility extends Document {
  name: string;
  imageUrl: string;
  description: string;
  pricePerHour: number;
  location: string;
  isDeleted: boolean;
}

export interface FacilityModel extends Model<TFacility> {}
