"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initOption = void 0;
function initOption(option) {
    if (option == null) {
        option = {};
    }
    if (option.scaleOptions == null) {
        option.scaleOptions = [
            {
                postfix: "",
                scale: 1.0
            },
            {
                postfix: "_xs",
                scale: 0.5
            }
        ];
    }
    return option;
}
exports.initOption = initOption;
