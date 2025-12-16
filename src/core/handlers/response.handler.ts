import { Response } from "express";

export const responseHandler = ({
  res,
  status = 200,
  message = "OK",
  data = {},
}: {
  res: Response;
  status?: number;
  message?: string;
  data?: Object;
}): Response => {
  return res.status(status).json({ status, message, data });
};
