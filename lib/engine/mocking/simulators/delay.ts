import {} from "../types"
import { BaseSimulator, SimulationConfig, SimulatorContext } from "../mockEngine"


export enum DelayType {
    Lognormal = "lognormal",
    Uniform = "uniform",
    ChunkedDribble = "chunked_dribble",
    Fixed = "fixed"
}

export type LognormalDelay = {
    type: DelayType.Lognormal,
    median: number, // 90
    sigma: number // 0.1
}

export type UniformDelay = {
    type: DelayType.Uniform,
    lower: number, // 15
    upper: number // 25
}

export type ChunkedDribbleDelay = {
    type: DelayType.ChunkedDribble,
    numberOfChunks: number, // 5
    duration: number // 1000
}
export type FixedDelay = {
    type: DelayType.Fixed,
    delay: number // 1000
}

export type DelayData = {
    delay: LognormalDelay | UniformDelay | ChunkedDribbleDelay | FixedDelay
}


export class DelaySimulator extends BaseSimulator<DelayData> {
    constructor(config: SimulationConfig) {
        super(config);
        this.namespace = "delay";
    }

    evaluate(context: SimulatorContext<DelayData>): void {

        this.log("evaluate", `Processing in ${this.constructor.name}`);

        if((context.settings as any).type == DelayType.Fixed) {
            return this.fixedDelay(context, 
                ((context.settings as any).delay));
        }

        context.next();
    }

    private fixedDelay(context: SimulatorContext<DelayData>, delayValue: number): any {
        this.log("FixedDelay", `Delaying for ${delayValue}ms`)
        return setTimeout(context.next, delayValue);
    }
}