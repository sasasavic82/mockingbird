

import { Request, Response, NextFunction } from "express";
import { IncomingData, ConnectionFaultType } from "../../types";
import { passed } from "../../../../utils/tools"
import chalk from "chalk";

const log = console.log;

const emptyResponse = (req: Request, res: Response, next: NextFunction) => {

    let incomingData = res.locals as any as IncomingData;

    if (!incomingData.settings.connection ||
        incomingData.settings.connection != ConnectionFaultType.EmptyResponse)
        return next();

    let pass = passed(incomingData.settings.failurePercentage);

    if (pass.passed)
        return next();

    log("------ " + chalk.red.bgWhite.bold(`${incomingData.settings.connection}`) + " ------")

    return res.status(200).end();
}

const resetConnection = (req: Request, res: Response, next: NextFunction) => {

    let incomingData = res.locals as any as IncomingData;

    if (!incomingData.settings.connection ||
        incomingData.settings.connection != ConnectionFaultType.ConnectioResetByPeer)
        return next();

    let pass = passed(incomingData.settings.failurePercentage);

    if (pass.passed)
        return next();

    log("------ " + chalk.red.bgWhite.bold(`${incomingData.settings.connection}`) + " ------")

    return res.end();

}

export default [
    resetConnection,
    emptyResponse
];