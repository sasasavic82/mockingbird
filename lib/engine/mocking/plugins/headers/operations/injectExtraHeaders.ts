
import { Response } from "express";
import { HeaderSettings } from "../../../types";

export default (res: Response, settings: HeaderSettings): void => {
    console.log("[headers] injecting extra headers...");
    if(settings.extraHeaders) {
        settings.extraHeaders.forEach((header) => {
            res.set(header.key, header.value);
        });
    }
}