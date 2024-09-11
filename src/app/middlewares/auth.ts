import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../config";
import AppError from "../errors/AppError";
import { TRole } from "../modules/user/user.interface";
import { User } from "../modules/user/user.model";
import catchAsync from "../utils/catchAsync";

const auth = (...requiredRoles: TRole[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const bearerToken = req.headers.authorization;
    console.log({ bearerToken });
    const splitToken = bearerToken?.split(" ");

    console.log({ splitToken });
    const token = splitToken ? splitToken[1] : null;
    console.log({ token });

    // checking if the token is missing
    if (!token) {
      return res.status(httpStatus.UNAUTHORIZED).json({
        success: false,
        statusCode: 401,
        message: "You have no access to this route",
      });
    }

    // checking if the given token is valid
    const decoded = jwt.verify(
      token,
      config.jwt_access_secret as string
    ) as JwtPayload;

    const { role, email } = decoded;
    // console.log(decoded);
    // checking if the user is exist
    const user = await User.isUserExistsByCustomEmail(email);

    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, "This user is not found !");
    }
    // checking if the user is already deleted

    const isDeleted = user?.isDeleted;

    if (isDeleted) {
      throw new AppError(httpStatus.FORBIDDEN, "This user is deleted !");
    }
    // console.log({ requiredRoles }, !requiredRoles.includes(role));
    // if (requiredRoles && !requiredRoles.includes(role)) {
    //   return res.status(httpStatus.UNAUTHORIZED).json({
    //     success: false,
    //     statusCode: 401,
    //     message: "You have no access to this route",
    //   });
    // }

    req.user = decoded as JwtPayload;
    // console.log(req.user);
    next();
  });
};

export default auth;
