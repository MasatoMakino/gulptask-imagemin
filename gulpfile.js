"use strict";

const { src, dest, series, parallel } = require("gulp");
const imagemin = require("gulp-imagemin");
const newer = require("gulp-newer");
const imageResize = require("gulp-image-resize");
const mozjpeg = require("imagemin-mozjpeg");
const path = require("path");

const imageDir = "./src/img/";
const distDir = "./dist/";

const baseName = path.basename(imageDir);
const imgExtension = "+(jpg|jpeg|png|gif|svg)";
const srcImages = path.resolve(imageDir, "**/*." + imgExtension);

const imgExtension_responsive = "+(jpg|jpeg|png|gif)";
const srcResponsiveImages = path.resolve(
  imageDir,
  "**/*." + imgExtension_responsive
);

const bufferImgPath = "./.imgBuffer/";

const imageminOption = [
  imagemin.gifsicle(),
  mozjpeg(),
  imagemin.optipng(),
  imagemin.svgo()
];

const minimize = (srcImages, distImgPath, resizeOptions) => {
  const hasResizeOption = resizeOptions !== undefined;
  let stream = src(srcImages).pipe(newer(distImgPath));
  if (hasResizeOption) {
    stream = stream.pipe(imageResize(resizeOptions));
  }
  return stream.pipe(imagemin(imageminOption)).pipe(dest(distImgPath));
};

const imagemin_full = () => {
  const distImgPath = path.resolve(bufferImgPath, baseName);
  return minimize(srcImages, distImgPath);
};

const imagemin_responsive = () => {
  const distImgPath = path.resolve(bufferImgPath, baseName + "_xs");
  const resizeOptions = {
    percentage: 50,
    imageMagick: true
  };
  return minimize(srcResponsiveImages, distImgPath, resizeOptions);
};

const copy = () => {
  return src([bufferImgPath + "**/*"], { base: bufferImgPath }).pipe(
    dest(distDir)
  );
};

exports.images = series(parallel(imagemin_full, imagemin_responsive), copy);
