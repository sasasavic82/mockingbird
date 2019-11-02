
import { BaseSimulator } from "../baseSimulator"
import { SimulationConfig, SimulatorContext } from "../common/types"
import { maybeWithDefault, randomBetween, removeRandomArray, removeRandomProperty } from "../../utils/tools";
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

export type BodyData = {
    randomRemove?: boolean,
    randomContentType?: boolean
}

export class BodySimulator extends BaseSimulator<BodyData> {
    constructor(config: SimulationConfig) {
        super(config);
        this.namespace = "body";
    }

    evaluate(context: SimulatorContext<BodyData>): void {

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

}
