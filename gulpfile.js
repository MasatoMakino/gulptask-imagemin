"use strict";

const { src, dest, series, parallel } = require("gulp");
const imagemin = require("gulp-imagemin");
const newer = require("gulp-newer");
const imageResize = require("gulp-image-resize");
const mozjpeg = require("imagemin-mozjpeg");

const srcDir = "./src/";
const distDir = "./dist/";
const imgExtension = "+(jpg|jpeg|png|gif|svg)";
const srcImages = srcDir + "img/**/*." + imgExtension;
const imgExtension_responsive = "+(jpg|jpeg|png|gif)";
const srcResponsiveImages = srcDir + "img/**/*." + imgExtension_responsive;

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
  const distImgPath = bufferImgPath + "img";
  return minimize(srcImages, distImgPath);
};

const imagemin_responsive = () => {
  const distImgPath = bufferImgPath + "img_xs";
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
