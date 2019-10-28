

import { Request, Response, NextFunction } from "express";
import {Settings, IncomingData} from "../../types";
import chalk from "chalk";

const log = console.log;

const validate = (req: Request, res: Response, next: NextFunction) => {

    log("------ " + chalk.red.bgWhite.bold("validate") + " ------")

    if(!req.body.settings) 
        return res.status(200).send(req.body);

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