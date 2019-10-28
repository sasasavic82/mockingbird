
import { Response } from "express";
import { HeaderSettings } from "../../../types";

export default (res: Response, settings: HeaderSettings): void => {
    console.log("[headers] permutating headers...");
    if(settings.permutate) {

    }
}