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
