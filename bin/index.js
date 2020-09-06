"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.get = exports.bufferImgPath = void 0;
const gulp_1 = require("gulp");
const Option_1 = require("./Option");
const MinimizeTask_1 = require("./MinimizeTask");
exports.bufferImgPath = "./.imgBuffer/";
/**
 * 画像を複数のスケールにリサイズし、最適化するタスク
 * @param {string} imageDir
 * @param {string} distDir
 * @param {Option} [option]
 * @return {Function} gulpタスク
 */
function get(imageDir, distDir, option) {
    option = Option_1.initOption(option);
    const tasks = [];
    option.scaleOptions.forEach(scaleOption => {
        tasks.push(MinimizeTask_1.getImageTask(imageDir, scaleOption));
    });
    const copy = () => {
        return gulp_1.src([exports.bufferImgPath + "**/*"], { base: exports.bufferImgPath }).pipe(gulp_1.dest(distDir));
    };
    return gulp_1.series(gulp_1.parallel.apply(null, tasks), copy);
}
exports.get = get;
