
import { Response } from "express";
import { HeaderSettings } from "../../../types";

export default (res: Response, settings: HeaderSettings): void => {
    console.log("[headers] injecting random headers...");
    if(settings.injectRandom) {
        
    }
}