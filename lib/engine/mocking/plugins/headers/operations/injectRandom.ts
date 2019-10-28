
import { Response } from "express";
import { HeaderSettings } from "../../../types";
import chalk from "chalk";

const log = console.log;

export default (res: Response, settings: HeaderSettings): void => {
    
    if(settings.injectRandom) {
        log("------ " + chalk.red.bgWhite.bold("inject random headers") + " ------")
    }
}