"use strict";
const images = require("./bin").generateTasks("./srcImg/img", "./dist");
images.optimize();
images.watchImages();