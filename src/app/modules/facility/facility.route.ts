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
