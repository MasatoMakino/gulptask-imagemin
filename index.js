"use strict";

const { src, dest, series, parallel } = require("gulp");
const imagemin = require("gulp-imagemin");
const newer = require("gulp-newer");
const imageResize = require("gulp-image-resize");
const mozjpeg = require("imagemin-mozjpeg");
const path = require("path");

const bufferImgPath = "./.imgBuffer/";
const imgExtension = "+(jpg|jpeg|png|gif|svg)";
const imgExtension_responsive = "+(jpg|jpeg|png|gif)";

const imageminOption = [
  imagemin.gifsicle(),
  mozjpeg(),
  imagemin.optipng(),
  imagemin.svgo()
];

module.exports = (imageDir, distDir) => {

  const baseName = path.basename(imageDir);
  const srcImages = path.resolve(imageDir, "**/*." + imgExtension);
  const srcResponsiveImages = path.resolve(
    imageDir,
    "**/*." + imgExtension_responsive
  );

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

  return series(parallel(imagemin_full, imagemin_responsive), copy);
};
