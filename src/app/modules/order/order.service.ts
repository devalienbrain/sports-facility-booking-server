import { initiatePayment } from "../payment/payment.utils";
import Order from "./order.model";

const createOrder = async (orderData: any) => {
  const { user, totalPayableAmount, bookingIds } = orderData;
  console.log({ orderData });
  const transactionId = `TXN-${Date.now()}`;

  const order = new Order({
    user,
    totalPayableAmount,
    bookingIds,
    status: "Pending",
    paymentStatus: "Pending",
    transactionId,
  });

  await order.save();

  const paymentData = {
    transactionId,
    totalPrice: totalPayableAmount,
    custormerName: user.name,
    customerEmail: user.email,
    customerPhone: user.phone,
    customerAddress: user.address,
  };

  //payment
  const paymentSession = await initiatePayment(paymentData);

  console.log(paymentSession);

  return paymentSession;
};

export const orderService = {
  createOrder,
};
