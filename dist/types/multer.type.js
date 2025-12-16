"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileType = exports.StoreInEnum = void 0;
var StoreInEnum;
(function (StoreInEnum) {
    StoreInEnum["DISK"] = "disk";
    StoreInEnum["MEMORY"] = "memory";
})(StoreInEnum || (exports.StoreInEnum = StoreInEnum = {}));
exports.FileType = {
    image: ["image/jpg", "image/jpeg", "image/png", "image/gif", "image/webp"],
    video: ["video/mp4", "video/webm"],
};
