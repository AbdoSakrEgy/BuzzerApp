"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPresignedUrlToGetFileS3 = exports.createPreSignedUrlToUploadFileS3 = exports.deleteMultiFilesS3 = exports.deleteFileS3 = exports.getFileS3 = exports.uploadMultiFilesS3 = exports.uploadSingleLargeFileS3 = exports.uploadSingleSmallFileS3 = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const fs_1 = require("fs");
const S3_config_1 = require("./S3.config");
const lib_storage_1 = require("@aws-sdk/lib-storage");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const multer_types_1 = require("../../types/multer.types");
const app_error_1 = require("../../core/errors/app.error");
const crypto_1 = require("crypto");
const http_status_code_1 = require("./../../core/http/http.status.code");
// ============================ uploadSingleSmallFileS3 ============================
const uploadSingleSmallFileS3 = async ({ Bucket = process.env.BUCKET_NAME, ACL = "private", dest = "general", fileFromMulter, storeIn = multer_types_1.StoreInEnum.MEMORY, }) => {
    const Key = `BuzzerApp/${dest}/${fileFromMulter.originalname}__${(0, crypto_1.randomUUID)()}`;
    // Use PutObjectCommand for buffers (known length), Upload for streams (unknown length)
    if (storeIn === multer_types_1.StoreInEnum.MEMORY) {
        const command = new client_s3_1.PutObjectCommand({
            Bucket,
            ACL,
            Key,
            Body: fileFromMulter.buffer,
            ContentType: fileFromMulter.mimetype,
        });
        await (0, S3_config_1.S3Config)().send(command);
    }
    else {
        // Use Upload for streams to avoid "unknown length" warning
        const upload = new lib_storage_1.Upload({
            client: (0, S3_config_1.S3Config)(),
            params: {
                Bucket,
                ACL,
                Key,
                Body: (0, fs_1.createReadStream)(fileFromMulter.path),
                ContentType: fileFromMulter.mimetype,
            },
        });
        await upload.done();
    }
    return Key;
};
exports.uploadSingleSmallFileS3 = uploadSingleSmallFileS3;
// ============================ uploadSingleLargeFileS3 ============================
const uploadSingleLargeFileS3 = async ({ Bucket = process.env.BUCKET_NAME, ACL = "private", dest = "general", fileFromMulter, storeIn = multer_types_1.StoreInEnum.MEMORY, }) => {
    const upload = new lib_storage_1.Upload({
        client: (0, S3_config_1.S3Config)(),
        // partSize: 10 * 1024 * 1024,
        params: {
            Bucket,
            ACL,
            Key: `BuzzerApp/${dest}/${fileFromMulter.originalname}__${(0, crypto_1.randomUUID)()}`,
            Body: storeIn == multer_types_1.StoreInEnum.MEMORY
                ? fileFromMulter.buffer
                : (0, fs_1.createReadStream)(fileFromMulter.path),
            ContentType: fileFromMulter.mimetype,
        },
    });
    upload.on("httpUploadProgress", (process) => {
        console.log({ process });
    });
    const { Key } = await upload.done(); // Note: it is "Key" not "key"
    if (!Key) {
        throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.INTERNAL_SERVER_ERROR, "Error while uploading file");
    }
    return Key;
};
exports.uploadSingleLargeFileS3 = uploadSingleLargeFileS3;
// ============================ uploadMultiFilesS3 ============================
const uploadMultiFilesS3 = async ({ Bucket = process.env.BUCKET_NAME, ACL = "private", dest = "general", filesFromMulter, storeIn = multer_types_1.StoreInEnum.MEMORY, }) => {
    // fast upload
    const keys = Promise.all(filesFromMulter.map((fileFromMulter) => {
        if (storeIn == multer_types_1.StoreInEnum.MEMORY) {
            return (0, exports.uploadSingleSmallFileS3)({
                Bucket,
                ACL,
                dest,
                fileFromMulter,
                storeIn,
            });
        }
        else {
            return (0, exports.uploadSingleLargeFileS3)({
                Bucket,
                ACL,
                dest,
                fileFromMulter,
                storeIn,
            });
        }
    }));
    return keys;
    // slow upload
    // const keys = [];
    // for (const file of files) {
    //   if (storeIn == StoreIn.memory) {
    //     const key = await uploadSingleFileS3({
    //       Bucket,
    //       ACL,
    //       path,
    //       file,
    //       storeIn,
    //     });
    //     keys.push(key);
    //   } else {
    //     const key = await uploadSingleLargeFileS3({
    //       Bucket,
    //       ACL,
    //       path,
    //       file,
    //       storeIn,
    //     });
    //     keys.push(key);
    //   }
    // }
    // return keys;
};
exports.uploadMultiFilesS3 = uploadMultiFilesS3;
// ============================ getFileS3 ============================
const getFileS3 = async ({ Bucket = process.env.BUCKET_NAME, Key, }) => {
    const command = new client_s3_1.GetObjectCommand({ Bucket, Key });
    const fileObject = await (0, S3_config_1.S3Config)().send(command);
    return fileObject;
};
exports.getFileS3 = getFileS3;
// ============================ deleteFileS3 ============================
const deleteFileS3 = async ({ Bucket = process.env.BUCKET_NAME, Key, }) => {
    // Check if file exists first
    try {
        await (0, S3_config_1.S3Config)().send(new client_s3_1.HeadObjectCommand({ Bucket, Key }));
    }
    catch (error) {
        if (error.name === "NotFound" || error.$metadata?.httpStatusCode === 404) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.NOT_FOUND, "File not found");
        }
        throw error;
    }
    const command = new client_s3_1.DeleteObjectCommand({ Bucket, Key });
    const result = await (0, S3_config_1.S3Config)().send(command);
    return result;
};
exports.deleteFileS3 = deleteFileS3;
// ============================ deleteMultiFilesS3 ============================
const deleteMultiFilesS3 = async ({ Bucket = process.env.BUCKET_NAME, Keys, Quiet = false, // false => returns Deleted[] and Errors[] true => returns only Errors[]
 }) => {
    // Check if all files exist first
    if (Keys && Keys.length > 0) {
        const notFoundKeys = [];
        for (const Key of Keys) {
            try {
                await (0, S3_config_1.S3Config)().send(new client_s3_1.HeadObjectCommand({ Bucket, Key }));
            }
            catch (error) {
                if (error.name === "NotFound" ||
                    error.$metadata?.httpStatusCode === 404) {
                    notFoundKeys.push(Key);
                }
                else {
                    throw error;
                }
            }
        }
        if (notFoundKeys.length > 0) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.NOT_FOUND, `Files not found: ${notFoundKeys.join(", ")}`);
        }
    }
    const Objects = Keys?.map((Key) => {
        return { Key };
    });
    const command = new client_s3_1.DeleteObjectsCommand({
        Bucket,
        Delete: {
            Objects,
            Quiet,
        },
    });
    const result = await (0, S3_config_1.S3Config)().send(command);
    return result;
};
exports.deleteMultiFilesS3 = deleteMultiFilesS3;
// ============================ createPreSignedUrlToUploadFileS3 ============================
const createPreSignedUrlToUploadFileS3 = async ({ Bucket = process.env.BUCKET_NAME, ACL = "private", dest = "general", fileName, ContentType, expiresIn = 5 * 60, }) => {
    const command = new client_s3_1.PutObjectCommand({
        Bucket,
        ACL,
        Key: `BuzzerApp/${dest}/${fileName}__${(0, crypto_1.randomUUID)()}`,
        ContentType,
    });
    const url = await (0, s3_request_presigner_1.getSignedUrl)((0, S3_config_1.S3Config)(), command, { expiresIn });
    if (!url || !command.input.Key) {
        throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.INTERNAL_SERVER_ERROR, "Failed to generate preSignedURL");
    }
    return { url, Key: command.input.Key };
};
exports.createPreSignedUrlToUploadFileS3 = createPreSignedUrlToUploadFileS3;
// ============================ createPresignedUrlToGetFileS3 ============================
const createPresignedUrlToGetFileS3 = async ({ Bucket = process.env.BUCKET_NAME, Key, downloadName = "dumy", download = false, expiresIn = 5 * 60, }) => {
    // Check if file exists first
    try {
        await (0, S3_config_1.S3Config)().send(new client_s3_1.HeadObjectCommand({ Bucket, Key }));
    }
    catch (error) {
        if (error.name === "NotFound" || error.$metadata?.httpStatusCode === 404) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.NOT_FOUND, "File not found");
        }
        throw error;
    }
    const command = new client_s3_1.GetObjectCommand({
        Bucket,
        Key,
        ResponseContentDisposition: download
            ? `attachment; filename=${downloadName}`
            : undefined,
    });
    const url = await (0, s3_request_presigner_1.getSignedUrl)((0, S3_config_1.S3Config)(), command, { expiresIn });
    if (!url) {
        throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.INTERNAL_SERVER_ERROR, "Failed to generate preSignedURL");
    }
    return url;
};
exports.createPresignedUrlToGetFileS3 = createPresignedUrlToGetFileS3;
