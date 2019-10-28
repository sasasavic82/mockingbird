
import { Response } from "express";
import { BodySettings } from "../../../types";
import { randomBetween } from "../../../../../utils/tools"
import chalk from "chalk";

const log = console.log;

const mimeTypes = [
    "application/javascript",
    "application/json",
    "application/x-www-form-urlencoded",
    "application/xml",
    "application/zip",
    "application/pdf",
    "application/sql",
    "application/graphql",
    "audio/mpeg",
    "audio/ogg",
    "multipart/form-data",
    "text/css",
    "text/html",
    "text/xml",
    "text/csv",
    "text/plain",
    "image/png",
    "image/jpeg",
    "image/gif",
    "application/vnd.api+json"
];

export default (res: Response, settings: BodySettings): void => {
    if(settings.randomContentType) {
        log("------ " + chalk.red.bgWhite.bold("body: alter content type") + " ------")
        let contentType: string = mimeTypes[randomBetween(0, mimeTypes.length - 1)];
        console.log(`changing to: ${contentType}`)
        res.set("Content-Type", contentType);
    }
}