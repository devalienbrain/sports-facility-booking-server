import { NextFunction, Request, Response } from "express";
import { UserServices } from "./user.service";

const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userData = req.body;
    // console.log(req.body);
    // const zodParsedData = studentValidationSchema.parse(studentData);

    const result = await UserServices.createUserIntoDB(userData);

    res.status(200).json({
      statusCode: 200,
      success: true,
      message: "User registered succesfully",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const UserControllers = {
  createUser,
};
