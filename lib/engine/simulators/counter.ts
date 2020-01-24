import { BaseSimulator } from "../baseSimulator"
import { SimulationConfig, SimulatorContext } from "../common/types"

export interface EmptyData {};

export interface CounterIndex {
    [key: string]: number
}

export class CounterSimulator extends BaseSimulator<EmptyData> {
    
    private counter: CounterIndex = {};

    constructor(config: SimulationConfig) {
        super(config);
        this.namespace = "counter";
    }
    evaluate(context: SimulatorContext<EmptyData>): void {
        let uuid = context.req.get('x-telstra-mockingbird-id');

        if(!uuid)
            return context.next();

        this.createAndIncrement(uuid);

        context.next();
    }

    createAndIncrement(uuid: string): void {
        if(!this.counter[uuid])
            this.counter[uuid] = 0;
            
        this.counter[uuid] += 1;

        this.log("createAndIncrement", `request number ${this.counter[uuid]}`);
    }
}