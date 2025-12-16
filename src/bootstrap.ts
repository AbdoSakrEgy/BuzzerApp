import express, { NextFunction, Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import router from "./routes";
import cors from "cors";
import { errorMiddleware } from "./core/middlewares/error.middleware";
import { rateLimit } from "express-rate-limit";
import { logger } from "./config/logger.config";
import { AppError } from "./core/errors/app.error";
import { HttpStatusCode } from "./core/http/http.status.code";
import { DBConnection, DBsync } from "./DB/db.connection";

const app = express();
dotenv.config({
  path: path.resolve("./src/config/.env"),
});
var whitelist = ["http://127.0.0.1:5501", undefined];
var corsOptions = {
  origin: function (origin: any, callback: any) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new AppError(HttpStatusCode.NOT_FOUND, "Not allowed by CORS"));
    }
  },
};
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  ipv6Subnet: 56,
});

const bootstrap = async () => {
  await DBConnection()
  await DBsync()

  app.use(limiter);
  app.use(cors(corsOptions));
  app.use(express.json());
  app.use("/api/v1", router);
  app.use(errorMiddleware);
  if (process.env.NODE_ENV !== "production") {
    app.listen(process.env.PORT, () => {
      console.log(
        `Backend server is running on port ${process.env.PORT} successfully`
      );
      console.log("====================================================");
    });
  }
};

export { app };
export default bootstrap;
