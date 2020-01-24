import { Response, NextFunction } from "express";
import { HTTPClientError, HTTP404Error } from "./httpErrors";

export const notFoundError = () => {
    throw new HTTP404Error("Method not found.");
}

export const clientError = (err: Error, res: Response, next: NextFunction) => {
    if (err instanceof HTTPClientError) {
        console.warn(JSON.stringify(err));
        res.status(err.statusCode).send(err.message);
    } else {
        next(err);
    }
}

export const serverError = (err: Error, res: Response, next: NextFunction) => {
    console.error(JSON.stringify(err));
    if(process.env.NODE_ENV === "production") {
        res.status(500).send("Internal Server Error");
    } else {
        res.status(500).send(err.stack);
    }
}