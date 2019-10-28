

import { Request, Response, NextFunction } from "express";
import chalk from "chalk";

const log = console.log;

const doNothing = (req: Request, res: Response, next: NextFunction) => {
    log("------ " + chalk.red.bgWhite.bold("do nothing") + " ------")
    next();
}

export default [
    doNothing
];