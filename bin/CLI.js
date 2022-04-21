#!/usr/bin/env node
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
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const index_1 = require("./index");
const program = new commander_1.Command();
program
    .option("--srcDir <string>", "source image dir")
    .option("--distDir <string>", "dist dir")
    .option("--scales <scaleOptions>", "scale options 'postfix:string','scale:number' ... 'postfix:string','scale:number'", (scaleOptions) => {
    const optionArray = scaleOptions.split(/\s+/);
    return optionArray.map((val) => {
        const set = val.split(",");
        return {
            postfix: set[0],
            scale: Number.parseFloat(set[1]),
        };
    });
})
    .option("-W --watch", "default : false")
    .parse(process.argv);
const args = program.opts();
(() => __awaiter(void 0, void 0, void 0, function* () {
    const tasks = (0, index_1.generateTasks)(args.srcDir, args.distDir, args.scales);
    if (args.watch) {
        tasks.watchImages();
    }
    else {
        tasks.optimize();
    }
}))();
