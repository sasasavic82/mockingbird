

import { Request, Response, NextFunction } from "express";
import {Settings, IncomingData} from "../../types";

const validate = (req: Request, res: Response, next: NextFunction) => {

    console.log("plugin: validate");

    const incomingData: IncomingData = {
        body: req.body.body,
        settings: req.body.settings as Settings
      };
      
    res.locals = incomingData;

    next();
}



export default [
    validate
];