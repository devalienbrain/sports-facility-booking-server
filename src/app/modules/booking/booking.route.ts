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
router.get("/user/:userId", auth("user"), getUserBookings);

router.delete("/:id", auth("user"), cancelBooking);

export const BookingRoutes = router;
