"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.multerUpload = void 0;
const multer_1 = __importDefault(require("multer"));
const app_error_1 = require("../../core/errors/app.error");
const http_status_code_1 = require("../../core/http/http.status.code");
const multer_type_1 = require("../../types/multer.type");
const multerUpload = ({ sendedFileDest = "general", sendedFileType = multer_type_1.FileType.image, storeIn = multer_type_1.StoreInEnum.DISK, }) => {
    const storage = storeIn == multer_type_1.StoreInEnum.MEMORY
        ? multer_1.default.memoryStorage()
        : multer_1.default.diskStorage({
        // destination: (req: any, file, cb) => {
        //   const fullDest = `uploads/${sendedFileDest}/${req.user._id}`;
        //   if (!fs.existsSync(fullDest)) {
        //     fs.mkdirSync(fullDest, { recursive: true });
        //   }
        //   cb(null, fullDest);
        // },
        // filename: (req: any, file, cb) => {
        //   cb(null, `${file.originalname}`);
        // },
        });
    const fileFilter = (req, file, cb) => {
        if (file.size > 200 * 1024 * 1024 && storeIn == multer_type_1.StoreInEnum.MEMORY) {
            return cb(new app_error_1.AppError(http_status_code_1.HttpStatusCode.BAD_REQUEST, "Use disk not memory"), false);
        }
        else if (!sendedFileType.includes(file.mimetype)) {
            return cb(new app_error_1.AppError(http_status_code_1.HttpStatusCode.BAD_REQUEST, "Invalid file format"), false);
        }
        cb(null, true);
    };
    return (0, multer_1.default)({ storage, fileFilter });
};
exports.multerUpload = multerUpload;
