"use strict";

exports.images = require("./bin").generateTask("./srcImg/img", "./dist");

exports.imagesNoScale = require("./bin").generateTask("./srcImg/img", "./dist", {
  scaleOptions: [{ postfix: "", scale: 1.0 }]
});

exports.imagesCustomScale = require("./bin").generateTask("./srcImg/img", "./dist", {
  scaleOptions: [
    { postfix: "", scale: 1.0 },
    { postfix: "_75", scale: 0.75 },
    { postfix: "_50", scale: 0.5 },
    { postfix: "_25", scale: 0.25 }
  ]
});

const rimraf = require("rimraf");
exports.clean = cb => {
  rimraf("./{\.imgBuffer,dist}/", cb);
};
