import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/app.error";

export const errorHandler = ({
  err,
  req,
  res,
  next,
}: {
  err: AppError;
  req: Request;
  res: Response;
  next: NextFunction;
}) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    status: statusCode,
    message: err.message,
    stack: err.stack,
  });
};
