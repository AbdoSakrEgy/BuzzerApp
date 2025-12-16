import {
  DeleteObjectCommand,
  DeleteObjectCommandOutput,
  DeleteObjectsCommand,
  GetObjectCommand,
  GetObjectCommandOutput,
  HeadObjectCommand,
  ObjectCannedACL,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { createReadStream } from "fs";
import { S3Config } from "./S3.config";
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { StoreInEnum } from "../../types/multer.types";
import { AppError } from "../../core/errors/app.error";
import { randomUUID } from "crypto";
import { HttpStatusCode } from "./../../core/http/http.status.code";

// ============================ uploadSingleSmallFileS3 ============================
export const uploadSingleSmallFileS3 = async ({
  Bucket = process.env.BUCKET_NAME as string,
  ACL = "private",
  dest = "general",
  fileFromMulter,
  storeIn = StoreInEnum.MEMORY,
}: {
  Bucket?: string;
  ACL?: ObjectCannedACL;
  dest?: string;
  fileFromMulter: Express.Multer.File;
  storeIn?: StoreInEnum;
}): Promise<string> => {
  const Key = `BuzzerApp/${dest}/${
    fileFromMulter.originalname
  }__${randomUUID()}`;

  // Use PutObjectCommand for buffers (known length), Upload for streams (unknown length)
  if (storeIn === StoreInEnum.MEMORY) {
    const command = new PutObjectCommand({
      Bucket,
      ACL,
      Key,
      Body: fileFromMulter.buffer,
      ContentType: fileFromMulter.mimetype,
    });
    await S3Config().send(command);
  } else {
    // Use Upload for streams to avoid "unknown length" warning
    const upload = new Upload({
      client: S3Config(),
      params: {
        Bucket,
        ACL,
        Key,
        Body: createReadStream(fileFromMulter.path),
        ContentType: fileFromMulter.mimetype,
      },
    });
    await upload.done();
  }

  return Key;
};

// ============================ uploadSingleLargeFileS3 ============================
export const uploadSingleLargeFileS3 = async ({
  Bucket = process.env.BUCKET_NAME as string,
  ACL = "private",
  dest = "general",
  fileFromMulter,
  storeIn = StoreInEnum.MEMORY,
}: {
  Bucket?: string;
  ACL?: ObjectCannedACL;
  dest?: string;
  fileFromMulter: Express.Multer.File;
  storeIn?: StoreInEnum;
}): Promise<string> => {
  const upload = new Upload({
    client: S3Config(),
    // partSize: 10 * 1024 * 1024,
    params: {
      Bucket,
      ACL,
      Key: `BuzzerApp/${dest}/${fileFromMulter.originalname}__${randomUUID()}`,
      Body:
        storeIn == StoreInEnum.MEMORY
          ? fileFromMulter.buffer
          : createReadStream(fileFromMulter.path),
      ContentType: fileFromMulter.mimetype,
    },
  });
  upload.on("httpUploadProgress", (process) => {
    console.log({ process });
  });
  const { Key } = await upload.done(); // Note: it is "Key" not "key"
  if (!Key) {
    throw new AppError(
      HttpStatusCode.INTERNAL_SERVER_ERROR,
      "Error while uploading file"
    );
  }
  return Key;
};

// ============================ uploadMultiFilesS3 ============================
export const uploadMultiFilesS3 = async ({
  Bucket = process.env.BUCKET_NAME as string,
  ACL = "private",
  dest = "general",
  filesFromMulter,
  storeIn = StoreInEnum.MEMORY,
}: {
  Bucket?: string;
  ACL?: ObjectCannedACL;
  dest?: string;
  filesFromMulter: Express.Multer.File[];
  storeIn?: StoreInEnum;
}): Promise<string[]> => {
  // fast upload
  const keys = Promise.all(
    filesFromMulter.map((fileFromMulter) => {
      if (storeIn == StoreInEnum.MEMORY) {
        return uploadSingleSmallFileS3({
          Bucket,
          ACL,
          dest,
          fileFromMulter,
          storeIn,
        });
      } else {
        return uploadSingleLargeFileS3({
          Bucket,
          ACL,
          dest,
          fileFromMulter,
          storeIn,
        });
      }
    })
  );
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

// ============================ getFileS3 ============================
export const getFileS3 = async ({
  Bucket = process.env.BUCKET_NAME as string,
  Key,
}: {
  Bucket?: string;
  Key?: string;
}): Promise<GetObjectCommandOutput> => {
  const command = new GetObjectCommand({ Bucket, Key });
  const fileObject = await S3Config().send(command);
  return fileObject;
};

// ============================ deleteFileS3 ============================
export const deleteFileS3 = async ({
  Bucket = process.env.BUCKET_NAME as string,
  Key,
}: {
  Bucket?: string;
  Key?: string;
}): Promise<DeleteObjectCommandOutput> => {
  // Check if file exists first
  try {
    await S3Config().send(new HeadObjectCommand({ Bucket, Key }));
  } catch (error: any) {
    if (error.name === "NotFound" || error.$metadata?.httpStatusCode === 404) {
      throw new AppError(HttpStatusCode.NOT_FOUND, "File not found");
    }
    throw error;
  }

  const command = new DeleteObjectCommand({ Bucket, Key });
  const result = await S3Config().send(command);
  return result;
};

// ============================ deleteMultiFilesS3 ============================
export const deleteMultiFilesS3 = async ({
  Bucket = process.env.BUCKET_NAME as string,
  Keys,
  Quiet = false, // false => returns Deleted[] and Errors[] true => returns only Errors[]
}: {
  Bucket?: string;
  Keys?: string[];
  Quiet?: boolean | undefined;
}): Promise<DeleteObjectCommandOutput> => {
  // Check if all files exist first
  if (Keys && Keys.length > 0) {
    const notFoundKeys: string[] = [];
    for (const Key of Keys) {
      try {
        await S3Config().send(new HeadObjectCommand({ Bucket, Key }));
      } catch (error: any) {
        if (
          error.name === "NotFound" ||
          error.$metadata?.httpStatusCode === 404
        ) {
          notFoundKeys.push(Key);
        } else {
          throw error;
        }
      }
    }
    if (notFoundKeys.length > 0) {
      throw new AppError(
        HttpStatusCode.NOT_FOUND,
        `Files not found: ${notFoundKeys.join(", ")}`
      );
    }
  }

  const Objects = Keys?.map((Key) => {
    return { Key };
  });
  const command = new DeleteObjectsCommand({
    Bucket,
    Delete: {
      Objects,
      Quiet,
    },
  });
  const result = await S3Config().send(command);
  return result;
};

// ============================ createPreSignedUrlToUploadFileS3 ============================
export const createPreSignedUrlToUploadFileS3 = async ({
  Bucket = process.env.BUCKET_NAME as string,
  ACL = "private",
  dest = "general",
  fileName,
  ContentType,
  expiresIn = 5 * 60,
}: {
  Bucket?: string;
  ACL?: ObjectCannedACL;
  dest?: string;
  fileName: String;
  ContentType: string;
  expiresIn?: number;
}): Promise<{ url: string; Key: string }> => {
  const command = new PutObjectCommand({
    Bucket,
    ACL,
    Key: `BuzzerApp/${dest}/${fileName}__${randomUUID()}`,
    ContentType,
  });

  const url = await getSignedUrl(S3Config(), command, { expiresIn });
  if (!url || !command.input.Key) {
    throw new AppError(
      HttpStatusCode.INTERNAL_SERVER_ERROR,
      "Failed to generate preSignedURL"
    );
  }
  return { url, Key: command.input.Key };
};

// ============================ createPresignedUrlToGetFileS3 ============================
export const createPresignedUrlToGetFileS3 = async ({
  Bucket = process.env.BUCKET_NAME as string,
  Key,
  downloadName = "dumy",
  download = false,
  expiresIn = 5 * 60,
}: {
  Bucket?: string;
  Key: string;
  downloadName?: string;
  download?: boolean;
  expiresIn?: number;
}): Promise<string> => {
  // Check if file exists first
  try {
    await S3Config().send(new HeadObjectCommand({ Bucket, Key }));
  } catch (error: any) {
    if (error.name === "NotFound" || error.$metadata?.httpStatusCode === 404) {
      throw new AppError(HttpStatusCode.NOT_FOUND, "File not found");
    }
    throw error;
  }

  const command = new GetObjectCommand({
    Bucket,
    Key,
    ResponseContentDisposition: download
      ? `attachment; filename=${downloadName}`
      : undefined,
  });
  const url = await getSignedUrl(S3Config(), command, { expiresIn });
  if (!url) {
    throw new AppError(
      HttpStatusCode.INTERNAL_SERVER_ERROR,
      "Failed to generate preSignedURL"
    );
  }
  return url;
};
