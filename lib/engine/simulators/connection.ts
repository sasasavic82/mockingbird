import { BaseSimulator } from "../baseSimulator"
import { SimulationConfig, SimulatorContext, ResponseStatus } from "../common/types"

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

        if((context.settings as unknown) == ConnectionFaultType.ConnectioResetByPeer) {
            return this.connectionResetByPeer(context)
        }

        if((context.settings as unknown) == ConnectionFaultType.EmptyResponse) {
            return this.emptyResponse(context)
        }

        context.next();
    }

    private connectionResetByPeer(context: SimulatorContext<ConnectionFaultData>): any {
        this.log("connectionResetByPeer", `abruptly resetting connection`)
        return context.res.status(500).end();
    }

    private emptyResponse(context: SimulatorContext<ConnectionFaultData>): any {
        this.log("emptyResponse", `emptying the response`);
        return context.res.status(ResponseStatus.OK).send();
    }

}