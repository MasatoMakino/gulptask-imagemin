"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTasks = exports.generateTask = exports.get = exports.bufferImgPath = void 0;
const Option_1 = require("./Option");
const MinimizeTask_1 = require("./MinimizeTask");
const fs_extra_1 = __importDefault(require("fs-extra"));
exports.bufferImgPath = "./.imgBuffer/";
/**
 * @deprecated
 * @param srcImageDir
 * @param distDir
 * @param option
 */
function get(srcImageDir, distDir, option) {
    return generateTask(srcImageDir, distDir, option);
}
exports.get = get;
/**
 * @deprecated
 * @param srcImageDir
 * @param distDir
 * @param option
 */
function generateTask(srcImageDir, distDir, option) {
    console.warn("This function is deprecated. Please use 'generateTasks'. この関数は廃止予定です。'generateTasks'関数を使用してください。");
    return generateTasks(srcImageDir, distDir, option).optimize;
}
exports.generateTask = generateTask;
/**
 * 画像を複数のスケールにリサイズし、最適化するタスクを生成する
 * @param srcImageDir
 * @param distDir
 * @param option
 */
function generateTasks(srcImageDir, distDir, option) {
    option = (0, Option_1.initOption)(option);
    return {
        optimize: () => __awaiter(this, void 0, void 0, function* () {
            const tasks = [];
            option.scaleOptions.forEach((scaleOption) => {
                const task = (0, MinimizeTask_1.getScalingTask)(srcImageDir, scaleOption);
                tasks.push(task);
            });
            yield Promise.all(tasks);
            fs_extra_1.default.copySync(exports.bufferImgPath, distDir);
            console.log("done : image optimize task");
        }),
        watchImages: (0, MinimizeTask_1.getWatchImages)(srcImageDir, distDir, option.scaleOptions),
    };
}
exports.generateTasks = generateTasks;
