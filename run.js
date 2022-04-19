"use strict";
const imageTasks = require("./bin").generateTasks("./srcImg/img", "./dist");
imageTasks.optimize();
imageTasks.watchImages();