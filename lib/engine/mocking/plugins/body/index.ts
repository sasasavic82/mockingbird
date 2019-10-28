

import { Request, Response, NextFunction } from "express";
import { IncomingData, BodySettings } from "../../types";
import { passed } from "../../../../utils/tools"

import { changeContentType, randomRemove } from "./operations";
import chalk from "chalk";

const log = console.log;

const body = (req: Request, res: Response, next: NextFunction) => {
    let incomingData = res.locals as any as IncomingData;

    log("------ " + chalk.red.bgWhite.bold("body") + " ------")

    if (!incomingData.settings.body)
        return next();

    let pass = passed(incomingData.settings.failurePercentage);

    if (pass.passed)
        return next();

    let body: BodySettings = incomingData.settings.body;

    if(body.randomRemove)
        incomingData.body = randomRemove(incomingData.body);

    if(body.randomContentType)
        changeContentType(res, body);

    res.locals = incomingData;

    next();
}

export default [body];