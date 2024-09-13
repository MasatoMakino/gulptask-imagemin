#!/usr/bin/env node

import { Command } from "commander";
import { generateTasks } from "./index.js";
import { ScaleOption } from "./Option.js";

const program = new Command();

program
  .option("--srcDir <string>", "source image dir")
  .option("--distDir <string>", "dist dir")
  .option("--colours <number>", "gif colours")
  .option(
    "--scales [scaleOptions]",
    "scale options 'postfix:string','scale:number'/'postfix:string','scale:number'",
    (scaleOptions): ScaleOption[] => {
      const optionArray = scaleOptions.split("/");
      return optionArray.map((val): ScaleOption => {
        const set = val.split(",");
        return {
          postfix: set[0],
          scale: Number.parseFloat(set[1]),
        };
      });
    }
  )
  .option("-W --watch", "default : false")
  .parse(process.argv);

const args = program.opts();

(async () => {
  const tasks = generateTasks(args.srcDir, args.distDir, {
    scaleOptions: args.scales,
    colours:args.colours
  });
  if (args.watch) {
    tasks.watchImages();
  } else {
    tasks.optimize();
  }
})();
