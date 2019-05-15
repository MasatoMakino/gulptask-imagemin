"use strict";

const { src, dest, series, parallel } = require("gulp");
const through2 = require("through2");
const imagemin = require("gulp-imagemin");
const newer = require("gulp-newer");
const sharp = require("sharp");
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

    const resize = (file, _, cb) => {
      const image = sharp(file.contents);
      image
        .metadata()
        .then(metadata => {
          const w = Math.round(
            (metadata.width * resizeOptions.percentage) / 100
          );
          return image.resize(w).toBuffer();
        })
        .then(data => {
          file.contents = data;
          cb(null, file);
        });
    };

    let stream = src(srcImages).pipe(newer(distImgPath));
    if (hasResizeOption) {
      stream = stream.pipe(through2.obj(resize));
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
      percentage: 50
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
