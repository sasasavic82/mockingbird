import { SimulationConfig, SimulatorContext } from "../common/types";
import { BaseSimulator } from "../baseSimulator"
import { maybeWithDefault, randomBetween } from "../../utils/tools";
import { KeyValue } from "../../utils/serviceTypes";

import { overrideSend, OverrideSendConfig } from "../../utils/monkeyPatch"

import chalk from "chalk";

import randomstring from "randomstring";

export type HeaderData = {
    duplicateHeader?: string,
    injectRandom?: boolean,
    permutate?: boolean,
    incorrectContentLength?: boolean
    extraHeaders?: KeyValue<string, string>[]
}

export class HeaderSimulator extends BaseSimulator<HeaderData> {
    constructor(config: SimulationConfig) {
        super(config);
        this.namespace = "header";
    }

    evaluate(context: SimulatorContext<HeaderData>): void {

        this.permutate(context);
        this.extraHeaders(context);
        this.injectRandom(context);
        this.incorrectContentLength(context);
        this.duplicateHeader(context);

        context.next();
    }

    private extraHeaders(context: SimulatorContext<HeaderData>): any {
        maybeWithDefault(context.settings.extraHeaders)([]).forEach((header) => {
            this.log("extraHeaders", `injecting ${header}`);
            context.res.set(header.key, header.value);
        });

    }

    private injectRandom(context: SimulatorContext<HeaderData>): any {
        if (maybeWithDefault(context.settings.injectRandom)(false)) {
            this.log("injectRandom", `injecting random headers`);
            context.res.set(randomstring.generate(), randomstring.generate());
        }
    }

    private permutate(context: SimulatorContext<HeaderData>): any {
        if (maybeWithDefault(context.settings.permutate)(false)) {
            this.log("permutate", `permutating headers` + chalk.red("NOTE: layer has not yet been implemented"));
        }
    }

    private incorrectContentLength(context: SimulatorContext<HeaderData>): any {
        if (maybeWithDefault(context.settings.incorrectContentLength)(false)) {
            this.log("incorrectContentLength", `faking content length`);
            const len: any = randomBetween(0, 10000);
            context.res.send = overrideSend({ contentLength: len });
            //context.res.send(context.res.locals.body);
        }
    }

    private duplicateHeader(context: SimulatorContext<HeaderData>): any {
        if(context.settings.duplicateHeader) {
            let header: string = context.settings.duplicateHeader;

            this.log("duplicateHeader", `duplicating ${header} header` + chalk.red("NOTE: layer has not yet been implemented"));

            return;
            
            let headerValue: string | undefined = context.req.get(header);

            console.log(headerValue);

            if(headerValue) {

                
                context.res.set({
                    [header]: headerValue,
                    [header]: headerValue
                });
            
                console.log(context.res.getHeaders)
            }
        }
    }
}


