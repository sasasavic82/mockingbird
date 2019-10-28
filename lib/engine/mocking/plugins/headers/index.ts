

import { Request, Response, NextFunction } from "express";
import { IncomingData, Operation, HeaderSettings } from "../../types";
import { passed, randomBetween } from "../../../../utils/tools"

import headerOperations from "./operations";

const headers = (req: Request, res: Response, next: NextFunction) => {
    let incomingData = res.locals as any as IncomingData;

    console.log(`plugin: headers`);

    if (!incomingData.settings.headers)
        return next();

    let pass = passed(incomingData.settings.failurePercentage);

    if (pass.passed)
        return next();

    let settings: HeaderSettings = incomingData.settings.headers;

    switch(incomingData.settings.headers.operation) {
        case Operation.Random:
            headerOperations[randomBetween(0, headerOperations.length - 1)](res, settings);
            break;
        case Operation.All:
            headerOperations.forEach((operation) => operation(res, settings));
            break;
        default:
            break;
    }
    
    res.locals = incomingData;

    next();
}

export default [headers];