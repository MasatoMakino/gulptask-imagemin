"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getImageTask = exports.getSharpStream = void 0;
const gulp_1 = require("gulp");
const through2_1 = __importDefault(require("through2"));
const gulp_imagemin_1 = __importDefault(require("gulp-imagemin"));
const gulp_newer_1 = __importDefault(require("gulp-newer"));
const sharp_1 = __importDefault(require("sharp"));
const imagemin_mozjpeg_1 = __importDefault(require("imagemin-mozjpeg"));
const path_1 = __importDefault(require("path"));
const index_1 = require("./index");
const imgExtension = "+(jpg|jpeg|png|gif|svg)";
const imgExtension_responsive = "+(jpg|jpeg|png|gif)";
const imageminOption = [
    gulp_imagemin_1.default.gifsicle(),
    imagemin_mozjpeg_1.default(),
    gulp_imagemin_1.default.optipng(),
    gulp_imagemin_1.default.svgo()
];
/**
 * SharpライブラリをラップしたStreamを作成する。
 * @param srcImageGlob
 * @param distImgPath
 * @param resizeOptions
 */
function getSharpStream(srcImageGlob, distImgPath, resizeOptions) {
    const hasResizeOption = resizeOptions !== undefined;
    const resize = (file, _, cb) => {
        const image = sharp_1.default(file.contents);
        image
            .metadata()
            .then(metadata => {
            const w = Math.ceil(metadata.width * resizeOptions.scale);
            return image.resize(w).toBuffer();
        })
            .then(data => {
            file.contents = data;
            cb(null, file);
        });
    };
    let stream = gulp_1.src(srcImageGlob).pipe(gulp_newer_1.default(distImgPath));
    if (hasResizeOption) {
        stream = stream.pipe(through2_1.default.obj(resize));
    }
    return stream.pipe(gulp_imagemin_1.default(imageminOption)).pipe(gulp_1.dest(distImgPath));
}
exports.getSharpStream = getSharpStream;
function getImageTask(imageDir, scaleOption) {
    const baseName = path_1.default.basename(imageDir);
    const srcImages = path_1.default.resolve(imageDir, "**/*." + imgExtension);
    const srcResponsiveImages = path_1.default.resolve(imageDir, "**/*." + imgExtension_responsive);
    const distImgPath = path_1.default.resolve(index_1.bufferImgPath, baseName + scaleOption.postfix);
    let imgGlob = srcImages;
    let resizeOption;
    if (scaleOption.scale !== 1.0) {
        imgGlob = srcResponsiveImages;
        resizeOption = {
            scale: scaleOption.scale
        };
    }
    // タスクを実行する関数を返す。
    // 無名関数でラップしないとタスク定義時点で即時実行されてしまうため。
    return () => {
        return getSharpStream(imgGlob, distImgPath, resizeOption);
    };
}
exports.getImageTask = getImageTask;
