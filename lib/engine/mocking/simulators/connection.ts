import {} from "../types"
import { BaseSimulator } from "../mockEngine"
import { SimulationConfig, SimulatorContext, ResponseStatus } from "../types"

export enum ConnectionFaultType {
    EmptyResponse = "empty_response",
    ConnectioResetByPeer = "connection_reset_by_peer"
}

export type ConnectionFaultData = {
    connection: ConnectionFaultType
}

export class ConnectionSimulator extends BaseSimulator<ConnectionFaultData> {
    constructor(config: SimulationConfig) {
        super(config);
        this.namespace = "conection";
    }

    evaluate(context: SimulatorContext<ConnectionFaultData>): void {

        this.log("evaluate", `Processing in ${this.constructor.name}`);

        if((context.settings as unknown) == ConnectionFaultType.ConnectioResetByPeer) {
            return this.connectionResetByPeer(context)
        }

        if((context.settings as unknown) == ConnectionFaultType.EmptyResponse) {
            return this.emptyResponse(context)
        }

        context.next();
    }

    private connectionResetByPeer(context: SimulatorContext<ConnectionFaultData>): any {
        this.log("connectionResetByPeer", `Abruptly resetting connection`)
        return context.res.end();
    }

    private emptyResponse(context: SimulatorContext<ConnectionFaultData>): any {
        this.log("emptyResponse", `Emptying the response`);
        return context.res.status(ResponseStatus.OK).send();
    }

}