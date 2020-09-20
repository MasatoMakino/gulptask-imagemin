"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initOption = void 0;
function initOption(option) {
    var _a;
    option !== null && option !== void 0 ? option : (option = {});
    (_a = option.scaleOptions) !== null && _a !== void 0 ? _a : (option.scaleOptions = [
        {
            postfix: "",
            scale: 1.0,
        },
        {
            postfix: "_xs",
            scale: 0.5,
        },
    ]);
    return option;
}
exports.initOption = initOption;
