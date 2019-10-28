

import { Request, Response, NextFunction } from "express";
import { IncomingData, FixedDelay, ChunkedDribbleDelay, UniformDelay, LognormalDelay, DelayType } from "../../types";
import { passed } from "../../../../utils/tools"
import chalk from "chalk";

const log = console.log;

const fixedDelay = (req: Request, res: Response, next: NextFunction) => {

    let incomingData = res.locals as any as IncomingData;

    if (!incomingData.settings.delay ||
        incomingData.settings.delay.type != DelayType.Fixed) {
        return next();
    }

    log("------ " + chalk.red.bgWhite.bold("fixed delay") + " ------")

    let pass = passed(incomingData.settings.failurePercentage);

    if (pass.passed)
        return next();

    log("------ " + chalk.red.bgWhite.bold(`delay: ${incomingData.settings.delay.delay}`) + " ------")

    let delayValue: number = (incomingData.settings.delay as FixedDelay).delay

    setTimeout(next, delayValue);

}

export default fixedDelay;