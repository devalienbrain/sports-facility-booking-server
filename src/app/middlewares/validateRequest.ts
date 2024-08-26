import { NextFunction, Request, Response } from "express";
import { AnyZodObject, ZodError } from "zod";
import catchAsync from "../utils/catchAsync";

const validateRequest = (schema: AnyZodObject) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
        cookies: req.cookies,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          statusCode: 400,
          message: "Validation error",
          errors: error.errors,
        });
      } else {
        next(error);
      }
    }
  });
};

export default validateRequest;
