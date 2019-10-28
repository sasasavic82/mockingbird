
import { Response } from "express";
import { HeaderSettings } from "../../../types";
import chalk from "chalk";

const log = console.log;

export default (res: Response, settings: HeaderSettings): void => {
    
    if(settings.extraHeaders) {
        log("------ " + chalk.red.bgWhite.bold("inject extra headers") + " ------")
        settings.extraHeaders.forEach((header) => {
            res.set(header.key, header.value);
        });
    }
}