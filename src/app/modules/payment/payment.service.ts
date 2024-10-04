// import { join } from "path";
// import orderModel from "../order/order.model";
// import { verifyPayment } from "./payment.utils";
// import { readFileSync } from "fs";
// import { Booking } from "../booking/booking.model";

// const confirmationService = async (transactionId: string, status: string) => {
//   // Verify the payment
//   const verifyResponse = await verifyPayment(transactionId);
//   // console.log({ verifyResponse });

//   let result;
//   let message = "";

//   // If the payment was successful
//   if (verifyResponse && verifyResponse.pay_status === "Successful") {
//     result = await orderModel.findOneAndUpdate(
//       { transactionId },
//       { paymentStatus: "Paid" }
//     );

//     // Check if the order exists
//     if (result) {
//       const { bookingIds } = result;

//       //   console.log({ bookingIds });

//       const bookingIdArray = bookingIds.map((item) => item.bookingId);

//       await Booking.deleteMany({ _id: { $in: bookingIdArray } });

//       await orderModel.updateOne(
//         { transactionId },
//         { $set: { bookingIds: [] } }
//       );

//       message = "Successfully Paid! All bookings have been deleted.";
//     } else {
//       message = "Order not found!";
//     }
//   } else {
//     message = "Payment Failed!";
//   }

//   const filePath = join(__dirname, "../../../views/confirmation.html");
//   let template = readFileSync(filePath, "utf-8");

//   template = template.replace("{{message}}", message);

//   return template;
// };

// export const paymentServices = {
//   confirmationService,
// };

import { join } from "path";
import orderModel from "../order/order.model";
import { verifyPayment } from "./payment.utils";
import { readFileSync } from "fs";
import { Booking } from "../booking/booking.model";

const confirmationService = async (transactionId: string, status: string) => {
  // Verify the payment
  const verifyResponse = await verifyPayment(transactionId);

  let result;
  let message = "";

  // If the payment was successful
  if (verifyResponse && verifyResponse.pay_status === "Successful") {
    result = await orderModel.findOneAndUpdate(
      { transactionId },
      { paymentStatus: "Paid" }
    );

    if (result) {
      const { bookingIds } = result;
      const bookingIdArray = bookingIds.map((item) => item.bookingId);
      await Booking.deleteMany({ _id: { $in: bookingIdArray } });

      await orderModel.updateOne(
        { transactionId },
        { $set: { bookingIds: [] } }
      );

      message = "Successfully Paid! All bookings have been cleared.";
    } else {
      message = "Order not found!";
    }
  } else {
    message = "Payment Failed!";
  }

  // Load and modify the HTML template for confirmation message
  const filePath = join(__dirname, "../../../views/confirmation.html");
  let template = readFileSync(filePath, "utf-8");

  // Replace placeholders in the HTML template with dynamic values from result
  template = template.replace("{{message}}", message);

  template = template
    .replace("{{message}}", message)
    .replace("{{user.name}}", result?.user?.name || "N/A")
    .replace("{{user.email}}", result?.user?.email || "N/A")
    .replace("{{user.phone}}", result?.user?.phone || "N/A")
    .replace("{{user.address}}", result?.user?.address || "N/A")
    .replace("{{transactionId}}", result?.transactionId || "N/A")
    .replace(
      "{{totalPayableAmount}}",
      result?.totalPayableAmount?.toFixed(2) || "0.00"
    )
    .replace(
      "{{createdAt}}",
      new Date(result?.createdAt).toDateString() || "N/A"
    );

  return template;
};

export const paymentServices = {
  confirmationService,
};
