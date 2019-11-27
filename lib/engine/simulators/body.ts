
import { BaseSimulator } from "../baseSimulator"
import { SimulationConfig, SimulatorContext } from "../common/types"
import { maybeWithDefault, randomBetween, removeRandomArray, removeRandomProperty, largeString } from "../../utils/tools";
import fs from "fs";
import path from "path";

import { overrideSend } from "../../utils/monkeyPatch"

import chalk from "chalk";

export const mimeTypes = [
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

export const encodingTypes = [
    "utf-8",
    "utf-16",
    "utf-32"
]

export type BodyData = {
    randomRemove?: boolean,
    randomContentType?: boolean,
    largePayload?: number, // Size in MB 0.01MB - 500MB
    encodingScheme?: string
}

export class BodySimulator extends BaseSimulator<BodyData> {
    constructor(config: SimulationConfig) {
        super(config);
        this.namespace = "body";
    }

    evaluate(context: SimulatorContext<BodyData>): void {

        this.encodingScheme(context);
        this.largePayload(context);
        this.randomContentType(context);
        let body = this.randomRemove(context);
        context.res.locals.body = body;
        context.next();
    }

    private randomRemove(context: SimulatorContext<BodyData>): any {
        if (maybeWithDefault(context.settings.randomRemove)(false)) {
            this.log("randomRemove", `randomly removing data properties`);
            if (Array.isArray(context.body))
                return removeRandomArray(context.body);
            else
                return removeRandomProperty(context.body);
        }
    }

    private randomContentType(context: SimulatorContext<BodyData>): any {
        if (maybeWithDefault(context.settings.randomContentType)(false)) {

            let contentType: string = mimeTypes[randomBetween(0, mimeTypes.length - 1)];
            this.log("randomContentType", `force-changing content type to ` + chalk.bold.green(`${contentType}`));

            context.res.set("Content-Type", contentType);
        }
    }

    private largePayload(context: SimulatorContext<BodyData>): any {
        if(context.settings.largePayload) {
            let cwd: string = process.cwd();
            let filePath: string = path.join(cwd, "big.txt");

            console.log(filePath);

            context.res.download(filePath);

            //const src = fs.createReadStream(filePath);

            /*
            fs.readFile(filePath, (err, data) => {
                if (err) throw err;
                //context.res.setHeader('Content-Transfer-Encoding', 'binary');
                //context.res.setHeader('Content-Type', 'application/octet-stream');
                return context.res.download()
              });

              return;

            */
            //src.pipe(context.res);
            //return;

            /**
             * Constrain the payload size to be between 0.01 and 500MB
             */
            /*
            if(context.settings.largePayload < 0.01 || context.settings.largePayload > 500) {
                context.res.status(413).json({
                    "message": `payload size must be between 0.01MB and 500MB`
                });
                return;
            }

            try {
                let payload: string = largeString(context.settings.largePayload);

                this.log("largePayload", `generated payload of ${context.settings.largePayload}MB`);

                context.res.set("Content-Type", "text/plain");
                context.res.send(payload);


            }catch(e) {
                this.log("largePayload", e);
                return;
            }
            */

        }
    }

    private encodingScheme(context: SimulatorContext<BodyData>): any {
        if (maybeWithDefault(context.settings.encodingScheme)("utf-8")) {

            /**
             * Ignore if the encoding schema doesn't match the allowed schema
             */
            if(!encodingTypes.includes(context.settings.encodingScheme as string))
                return;
            
            context.res.send = overrideSend({ overrideCharset: context.settings.encodingScheme });
            this.log("encodingScheme", `set ${context.settings.encodingScheme} encoding scheme`);
            context.res.send(context.res.locals.body);
        }
    }   

}
