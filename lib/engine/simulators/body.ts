
import { BaseSimulator } from "../baseSimulator"
import { SimulationConfig, SimulatorContext, SimulatorRequest, SimulatorResponse, NextSimulator, SimulationHandler } from "../common/types"
import { maybeWithDefault, randomBetween, removeRandomArray, removeRandomProperty, largeString } from "../../utils/tools";
import fs from "fs";
import path from "path";
import { exec } from "child_process";
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

export enum FileSize {
    TenMegabytes = '10',
    FiftyMegabytes = '50',
    HundredMegabytes = '100',
    TwoHundredMegabytes = '200',
    FiveHundredMegabytes = '500'
}

export type BodyData = {
    randomRemove?: boolean,
    randomContentType?: boolean,
    largePayload?: number, // Size in MB 0.01MB - 50MB
    largeFilesize?: FileSize,
    encodingScheme?: string,
    fakeEncoding?: boolean
}

export interface FileMapper {
    [key: string]: number
}

export interface ResponseBuffer {
    [key: string]: string
}

export let fileMapper: FileMapper = {
    '10': 10240,
    '50': 51200,
    '100': 102400,
    '200': 204800,
    '500': 512000
}

export class BodySimulator extends BaseSimulator<BodyData> {

    private currentWorkingDirectory: string = "";
    private responseBuffer: ResponseBuffer = {}

    constructor(config: SimulationConfig) {
        super(config);
        this.namespace = "body";
        this.currentWorkingDirectory = process.cwd();
    }

    evaluate(context: SimulatorContext<BodyData>): void {

        this.encodingScheme(context);
        this.largePayload(context);
        this.largeFileSize(context);
        this.randomContentType(context);
        this.fakeEncoding(context);
        this.randomRemove(context);

        context.next();
    }

    private randomRemove(context: SimulatorContext<BodyData>): any {
        if (maybeWithDefault(context.settings.randomRemove)(false)) {
            this.log("randomRemove", `randomly removing data properties`);

            let ret: (any | any[]);

            if (Array.isArray(context.body))
                ret = removeRandomArray(context.body);
            else
                ret = removeRandomProperty(context.body);

            context.res.locals.body = ret;

        }
    }

    private randomContentType(context: SimulatorContext<BodyData>): any {
        if (maybeWithDefault(context.settings.randomContentType)(false)) {

            let contentType: string = mimeTypes[randomBetween(0, mimeTypes.length - 1)];
            this.log("randomContentType", `force-changing content type to ` + chalk.bold.green(`${contentType}`));

            context.res.set("Content-Type", contentType);
        }
    }

    private fakeEncoding(context: SimulatorContext<BodyData>): any {
        if (maybeWithDefault(context.settings.fakeEncoding)(false)) {

            if(!context.req.headers["x-mockingbird-fake-compression"])
                return;

            context.res.setHeader("Content-Encoding", "gzip");
            context.res.removeHeader("Content-Length");

            this.log("fakeEncoding", `fake gzip encoding`);
        }
    }

    private largeFileSize(context: SimulatorContext<BodyData>): any {
        if(context.settings.largeFilesize) {

            let fileSize: (number | undefined) = fileMapper[context.settings.largeFilesize]

            if(!fileSize)
                return context.res.status(400).json({
                    message: `unacceptable fileSize. acceptable values: 10, 50, 100, 200 and 500`
                });

            let filePath = path.join(this.currentWorkingDirectory, `${context.settings.largeFilesize}.bin`);

            if(fs.existsSync(filePath)) {
                this.log("largeFileSize", `file ` + chalk.bold.green(`${filePath}` + ` exists`));

                return context.res.status(200).json({
                    status: "exists",
                    message: `file ${context.settings.largeFilesize}.bin exists`,
                    _link: `/api/v1/mock/download?fileSize=${context.settings.largeFilesize}`
                });
            }

            try {
                exec(`dd if=/dev/zero of=${filePath} bs=1024 count=${fileSize}`);
            } catch(e) {
                return context.res.status(500).json({
                    message: `unable to create ${context.settings.largeFilesize}.bin`
                });
            }
            
            this.log("largeFileSize", `created ` + chalk.bold.green(`${filePath}`));

            context.res.status(201).json({
                status: "created",
                message: `created ${context.settings.largeFilesize}.bin`,
                _link: `/api/v1/mock/download?fileSize=${context.settings.largeFilesize}`
            });
        }
    }

    private largePayload(context: SimulatorContext<BodyData>): any {
        if(context.settings.largePayload) {

            /**
             * Constrain the payload size to be between 0.001 (1kb) and 50MB
             */
            
            if(context.settings.largePayload < 0.001 || context.settings.largePayload > 50) {
                context.res.status(413).json({
                    "message": `payload size must be between 0.001MB (1KB) and 50MB`
                });
                return;
            }

            try {

                if(!this.responseBuffer[context.settings.largePayload])
                    this.responseBuffer[context.settings.largePayload] = largeString(context.settings.largePayload);

                this.log("largePayload", `generated payload of ${context.settings.largePayload}MB`);

                context.res.set("Content-Type", "text/plain");

                context.res.locals.body = this.responseBuffer[context.settings.largePayload]

                //return context.next();
                //context.res.send(this.responseBuffer[context.settings.largePayload]);


            }catch(e) {
                this.log("largePayload", e);
                return;
            }
    
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

    public largeFilesHandler(req: SimulatorRequest, res: SimulatorResponse, next: NextSimulator): any {

        if(!req.query.fileSize)
            return res.status(400).json({
                message: "missing fileSize query parameter"
            });

        let filePath = path.join(this.currentWorkingDirectory, `${req.query.fileSize}.bin`);

        if(!fs.existsSync(filePath))
            return res.status(404).end();

        this.log("largeFilesHandler", `downloading ${filePath}`);

        return res.download(filePath);
    }

}
