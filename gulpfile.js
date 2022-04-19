"use strict";

exports.images = require("./bin").generateTasks(
  "./srcImg/img",
  "./dist"
).optimize;

exports.imagesNoScale = require("./bin").generateTasks(
  "./srcImg/img",
  "./dist",
  {
    scaleOptions: [{ postfix: "", scale: 1.0 }],
  }
).optimize;

exports.imagesCustomScale = require("./bin").generateTasks(
  "./srcImg/img",
  "./dist",
  {
    scaleOptions: [
      { postfix: "", scale: 1.0 },
      { postfix: "_75", scale: 0.75 },
      { postfix: "_50", scale: 0.5 },
      { postfix: "_25", scale: 0.25 },
    ],
  }
).optimize;

const rimraf = require("rimraf");
exports.clean = (cb) => {
  rimraf("./{.imgBuffer,dist}/", cb);
};
