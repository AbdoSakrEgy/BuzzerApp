"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const routes_1 = __importDefault(require("./routes"));
const cors_1 = __importDefault(require("cors"));
const error_middleware_1 = require("./core/middlewares/error.middleware");
const express_rate_limit_1 = require("express-rate-limit");
const app_error_1 = require("./core/errors/app.error");
const http_status_code_1 = require("./core/http/http.status.code");
const db_connection_1 = require("./DB/db.connection");
const app = (0, express_1.default)();
exports.app = app;
dotenv_1.default.config({
    path: path_1.default.resolve("./src/config/.env"),
});
var whitelist = ["http://127.0.0.1:5501", undefined];
var corsOptions = {
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1) {
            callback(null, true);
        }
        else {
            callback(new app_error_1.AppError(http_status_code_1.HttpStatusCode.NOT_FOUND, "Not allowed by CORS"));
        }
    },
};
const limiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    ipv6Subnet: 56,
});
const bootstrap = async () => {
    await (0, db_connection_1.DBConnection)();
    await (0, db_connection_1.DBsync)();
    app.use(limiter);
    // app.use(cors(corsOptions));
    app.use((0, cors_1.default)());
    app.use(express_1.default.json());
    app.use("/api/v1", routes_1.default);
    app.use(error_middleware_1.errorMiddleware);
    if (process.env.NODE_ENV !== "production") {
        app.listen(process.env.PORT, () => {
            console.log(`Backend server is running on port ${process.env.PORT} successfully`);
            console.log("====================================================");
        });
    }
};
exports.default = bootstrap;
