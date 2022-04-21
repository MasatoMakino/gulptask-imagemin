"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWatchImages = exports.getScalingTask = exports.getNewerFileOptimizeTask = void 0;
const chokidar_1 = require("chokidar");
const fs_1 = __importDefault(require("fs"));
const node_newer_files_1 = __importDefault(require("node-newer-files"));
const path_1 = __importDefault(require("path"));
const sharp_1 = __importDefault(require("sharp"));
const index_1 = require("./index");
const imgExtensionArrayResponsive = ["jpg", "jpeg", "png", "gif"];
const imgExtensionArray = [...imgExtensionArrayResponsive, "svg"];
const imgExtension = `+(${imgExtensionArray.join("|")})`;
const imgExtension_responsive = `+(${imgExtensionArray.join("|")})`;
/**
 * .imgBufferディレクトリの更新差分を抽出して画像を最適化する
 */
function getNewerFileOptimizeTask(imageDir, srcImageGlob, distImgPath, extensions, resizeOption) {
    return __awaiter(this, void 0, void 0, function* () {
        const newFiles = node_newer_files_1.default.getFiles(extensions, imageDir, distImgPath);
        return optimizeFiles(newFiles, imageDir, distImgPath, resizeOption);
    });
}
exports.getNewerFileOptimizeTask = getNewerFileOptimizeTask;
/**
 * ファイルリストを最適化する
 * @param files
 * @param imageSrcDir
 * @param distImgPath
 * @param resizeOption
 */
const optimizeFiles = (files, imageSrcDir, distImgPath, resizeOption) => __awaiter(void 0, void 0, void 0, function* () {
    const promises = [];
    files.forEach((file) => {
        promises.push(optimizeFile(file, imageSrcDir, distImgPath, resizeOption));
    });
    return Promise.all(promises);
});
/**
 * 指定されたファイルを最適化する
 * @param file ファイルパス。imageSrcDirからの相対パス
 * @param imageSrcDir 画像ファイルのソースディレクトリ
 * @param distImgDir 画像ファイルの出力ディレクトリ bufferImgPathにスケーリング修飾子を追加したもの
 * @param resizeOption スケーリング修飾子とスケール値のセット
 * @param option
 * @param [option.useFsReadFile=false]  fs.readFileを利用するか否か。new Sharp(filePath)はディスクキャッシュが効くため、watchするとファイルが更新されない。
 */
const optimizeFile = (file, imageSrcDir, distImgDir, resizeOption, option) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const outputPath = path_1.default.resolve(distImgDir, file);
    const dir = path_1.default.dirname(outputPath);
    yield fs_1.default.promises.mkdir(dir, { recursive: true });
    option !== null && option !== void 0 ? option : (option = {});
    (_a = option.useFsReadFile) !== null && _a !== void 0 ? _a : (option.useFsReadFile = false);
    const filePath = path_1.default.resolve(imageSrcDir, file);
    const constructorOption = option.useFsReadFile
        ? yield fs_1.default.promises.readFile(filePath)
        : filePath;
    const sharpObj = yield new sharp_1.default(constructorOption);
    const metadata = yield sharpObj.metadata();
    if (resizeOption) {
        yield sharpObj.resize(Math.ceil(metadata.width * resizeOption.scale));
    }
    if (metadata.format === "jpeg") {
        yield sharpObj.toFormat(metadata.format, {
            mozjpeg: true,
            quality: 75,
        });
    }
    if (metadata.format === "png") {
        yield sharpObj.toFormat(metadata.format, {
            compressionLevel: 8,
            palette: true,
        });
    }
    return {
        sharp: yield sharpObj.toFile(outputPath),
        outputPath,
        distImgDir,
    };
});
function getScalingTask(imageDir, scaleOption) {
    return __awaiter(this, void 0, void 0, function* () {
        const distImgPath = getBufferOutputPath(imageDir, scaleOption);
        const isScale = scaleOption.scale !== 1.0;
        const extensionGlob = isScale ? imgExtension_responsive : imgExtension;
        const imgGlob = path_1.default.join("**/*." + extensionGlob);
        const resizeOption = isScale ? scaleOption : null;
        const extensions = isScale ? imgExtensionArrayResponsive : imgExtensionArray;
        return getNewerFileOptimizeTask(imageDir, imgGlob, distImgPath, extensions, resizeOption);
    });
}
exports.getScalingTask = getScalingTask;
const getBufferOutputPath = (imageDir, scaleOption) => {
    const baseName = path_1.default.basename(imageDir);
    return path_1.default.resolve(index_1.bufferImgPath, baseName + scaleOption.postfix);
};
function getWatchImages(imageDir, distDir, scaleOptions) {
    return () => {
        const imgGlob = path_1.default.join(imageDir, "**/*." + imgExtension);
        console.log("[gulptask-imagemin] " + imgGlob + " : start watching...");
        const onWatch = (filePath) => {
            const relativePath = path_1.default.relative(imageDir, filePath);
            scaleOptions.forEach((scaleOption) => __awaiter(this, void 0, void 0, function* () {
                const bufferDir = getBufferOutputPath(imageDir, scaleOption);
                const result = yield optimizeFile(relativePath, imageDir, bufferDir, scaleOption, { useFsReadFile: true });
                const bufferFilePath = path_1.default.relative(index_1.bufferImgPath, result.outputPath);
                const distFilePath = path_1.default.join(distDir, bufferFilePath);
                const copyDir = path_1.default.dirname(distFilePath);
                yield fs_1.default.promises.mkdir(copyDir, {
                    recursive: true,
                });
                yield fs_1.default.promises.copyFile(result.outputPath, distFilePath);
                console.log("[gulptask-imagemin] optimize image -> " + distFilePath);
            }));
        };
        (0, chokidar_1.watch)(imgGlob, { ignoreInitial: true }).on("add", onWatch);
        (0, chokidar_1.watch)(imgGlob).on("change", onWatch);
    };
}
exports.getWatchImages = getWatchImages;
