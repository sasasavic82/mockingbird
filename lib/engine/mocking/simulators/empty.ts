import { BaseSimulator } from "../mockEngine"
import { SimulationConfig, SimulatorContext } from "../types"

export interface EmptyData {};

export class EmptySimulator extends BaseSimulator<EmptyData> {
    constructor(config: SimulationConfig) {
        super(config);
        this.namespace = "empty";
    }
    evaluate(context: SimulatorContext<EmptyData>): void {
        this.log("evaluate", `Processing in ${this.constructor.name}`);
        context.next();
    }
}