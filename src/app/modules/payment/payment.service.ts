import { join } from "path";
import orderModel from "../order/order.model";
import { verifyPayment } from "./payment.utils";
import { readFileSync } from "fs";
import { Booking } from "../booking/booking.model";

const confirmationService = async (transactionId: string, status: string) => {
  // Verify the payment
  const verifyResponse = await verifyPayment(transactionId);
  // console.log({ verifyResponse });

  let result;
  let message = "";

  // If the payment was successful
  if (verifyResponse && verifyResponse.pay_status === "Successful") {
    result = await orderModel.findOneAndUpdate(
      { transactionId },
      { paymentStatus: "Paid" }
    );

    // Check if the order exists
    if (result) {
      const { bookingIds } = result;

      //   console.log({ bookingIds });

      const bookingIdArray = bookingIds.map((item) => item.bookingId);

      await Booking.deleteMany({ _id: { $in: bookingIdArray } });

      await orderModel.updateOne(
        { transactionId },
        { $set: { bookingIds: [] } }
      );

      message = "Successfully Paid! All bookings have been deleted.";
    } else {
      message = "Order not found!";
    }
  } else {
    message = "Payment Failed!";
  }

  const filePath = join(__dirname, "../../../views/confirmation.html");
  let template = readFileSync(filePath, "utf-8");

  template = template.replace("{{message}}", message);

  return template;
};

export const paymentServices = {
  confirmationService,
};
