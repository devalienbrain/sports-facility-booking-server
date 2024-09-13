import { Request, Response, NextFunction } from "express";
import { FacilityService } from "./facility.service";

export const createFacility = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const facility = await FacilityService.createFacility(req.body);
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Facility added successfully",
      data: facility,
    });
  } catch (error) {
    next(error);
  }
};

export const updateFacility = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const facility = await FacilityService.updateFacility(
      req.params.id,
      req.body
    );
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Facility updated successfully",
      data: facility,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteFacility = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const facility = await FacilityService.deleteFacility(req.params.id);
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Facility deleted successfully",
      data: facility,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllFacilities = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const facilities = await FacilityService.getAllFacilities();
    if (facilities.length === 0) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: "No Data Found",
        data: [],
      });
    }
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Facilities retrieved successfully",
      data: facilities,
    });
  } catch (error) {
    next(error);
  }
};

export const getFacilityById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const facility = await FacilityService.getFacilityById(req.params.id);

    if (!facility) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: "Facility not found",
      });
    }

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Facility retrieved successfully",
      data: facility,
    });
  } catch (error) {
    next(error);
  }
};
