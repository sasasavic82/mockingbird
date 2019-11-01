import { BaseSimulator } from "../mockEngine"
import { SimulationConfig, SimulatorContext } from "../common/types"

export interface EmptyData {};

export class EmptySimulator extends BaseSimulator<EmptyData> {
    constructor(config: SimulationConfig) {
        super(config);
        this.namespace = "empty";
    }
    evaluate(context: SimulatorContext<EmptyData>): void {
        context.next();
    }
}