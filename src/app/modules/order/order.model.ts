import mongoose, { Schema, Document } from "mongoose";

interface IOrder extends Document {
  user: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  bookingIds: Array<{
    bookingId: mongoose.Schema.Types.ObjectId;
  }>;
  totalPayableAmount: number;
  status: string;
  paymentStatus: string;
  transactionId?: string; // Optional initially
}

const OrderSchema: Schema = new Schema(
  {
    user: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
    },
    bookingIds: [
      {
        bookingId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Booking", 
          required: true,
        },
      },
    ],
    totalPayableAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Paid", "Shipped", "Completed", "Cancelled"],
      default: "Pending",
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed"],
      default: "Pending",
    },
    transactionId: {
      type: String, // This will be added once the payment is successful
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IOrder>("Order", OrderSchema);
