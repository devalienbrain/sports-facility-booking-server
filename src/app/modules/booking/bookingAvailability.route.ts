import { Router } from "express";
import { checkAvailability } from "./booking.controller";

const router = Router();

router.get("/", checkAvailability);

export const BookingAvailabilityCheckRoutes = router;
