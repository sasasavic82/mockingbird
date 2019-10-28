

import { Request, Response, NextFunction } from "express";

const doNothing = (req: Request, res: Response, next: NextFunction) => {
    console.log("plugin: doNothing");
    next();
}

export default [
    doNothing
];