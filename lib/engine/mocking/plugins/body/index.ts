

import { Request, Response, NextFunction } from "express";
import { IncomingData, BodySettings } from "../../types";
import { passed } from "../../../../utils/tools"

import { changeContentType, randomRemove } from "./operations";

const body = (req: Request, res: Response, next: NextFunction) => {
    let incomingData = res.locals as any as IncomingData;

    console.log(`plugin: body`);

    if (!incomingData.settings.body)
        return next();

    let pass = passed(incomingData.settings.failurePercentage);

    if (pass.passed)
        return next();

    let body: BodySettings = incomingData.settings.body;

    if(body.randomRemove)
        incomingData.body = randomRemove(incomingData.body);

    if(body.randomContentType)
        incomingData.body = changeContentType(res, body);

    console.log('wowwwwwww')
    console.log(incomingData.body);
    console.log('wowwwwwww')
    
    res.locals = incomingData;

    next();
}

export default [body];