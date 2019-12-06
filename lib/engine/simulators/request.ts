import { BaseSimulator } from "../baseSimulator"
import { SimulationConfig, SimulatorContext, ResponseStatus } from "../common/types"

export enum FailOnOptions {
    Same = 'same',
    Different = 'different'
}

export interface UrlVerificationSettings {
    url: string,
    failOn: FailOnOptions
}

export type RequestFaultData = {
    verifyUrl?: UrlVerificationSettings
}

export class RequestSimulator extends BaseSimulator<RequestFaultData> {
    constructor(config: SimulationConfig) {
        super(config);
        this.namespace = "request";
    }

    evaluate(context: SimulatorContext<RequestFaultData>): void {
        this.verifyUrl(context);
        context.next();
    }

    private verifyUrl(context: SimulatorContext<RequestFaultData>): any {

        if (context.settings.verifyUrl) {

            this.log("verifyUrl", `verifying URL structure`);

            switch (context.settings.verifyUrl.failOn) {
                case FailOnOptions.Same:

                    if (context.req.url === context.settings.verifyUrl.url) {
                        return context.res.status(400).send({
                            error: `original url: ${context.req.url} same as provided url: ${context.settings.verifyUrl.url}`
                        });
                    }
                    break;

                case FailOnOptions.Different:
                    if (context.req.url !== context.settings.verifyUrl.url) {
                        return context.res.status(400).send({
                            error: `original url: ${context.req.url} is different than the provided url: ${context.settings.verifyUrl.url}`
                        });
                    }
                    break;

            }

        }
    }

}