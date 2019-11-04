import { SimulationConfig, SimulatorContext } from "../common/types";
import { BaseSimulator } from "../baseSimulator"
import { maybeWithDefault } from "../../utils/tools";
import { KeyValue } from "../../utils/serviceTypes";
import chalk from "chalk";

import randomstring from "randomstring";


export enum ConnectionFaultType {
    EmptyResponse = "empty_response",
    ConnectioResetByPeer = "connection_reset_by_peer"
}

export type ConnectionFaultData = {
    connection: ConnectionFaultType
}

export type HeaderData = {
    injectRandom?: boolean,
    permutate?: boolean
    extraHeaders?: KeyValue<string, string>[]
}

export class HeaderSimulator extends BaseSimulator<HeaderData> {
    constructor(config: SimulationConfig) {
        super(config);
        this.namespace = "header";
    }

    evaluate(context: SimulatorContext<HeaderData>): void {

        console.log(context.req.headers);

        this.permutate(context);
        this.extraHeaders(context);
        this.injectRandom(context);

        context.next();
    }

    private extraHeaders(context: SimulatorContext<HeaderData>): any {
        this.log("extraHeaders", `injecting extra headers`);
        maybeWithDefault(context.settings.extraHeaders)([]).forEach((header) => {
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
            this.log("permutate", `permutating headers` + + chalk.red("NOTE: layer has not yet been implemented"));
        }
    }

}