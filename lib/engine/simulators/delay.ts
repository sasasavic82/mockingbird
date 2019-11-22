import "../../utils/extesions";

import { BaseSimulator } from "../baseSimulator"
import { SimulationConfig, SimulatorContext, SimulatorResponse } from "../common/types"
import { randomBetween } from "../../utils/tools"

export enum DelayType {
    Lognormal = "lognormal",
    Uniform = "uniform",
    ChunkedDribble = "chunked_dribble",
    Fixed = "fixed",
    Random = "random"
}

export type RandomDelay = {
    type: DelayType.Random,
    from: number, // 90
    to: number // 0.1
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
    delay: LognormalDelay | UniformDelay | ChunkedDribbleDelay | FixedDelay | RandomDelay
}


export class DelaySimulator extends BaseSimulator<DelayData> {

    private chunkDribble: ChunkDribble = new ChunkDribble();

    constructor(config: SimulationConfig) {
        super(config);
        this.namespace = "delay";
    }

    evaluate(context: SimulatorContext<DelayData>): void {

        if ((context.settings as any).type == DelayType.Fixed) {
            return this.fixedDelay(context);
        }

        if ((context.settings as any).type == DelayType.ChunkedDribble) {
            return this.chunked(context);
        }

        if ((context.settings as any).type == DelayType.Random) {
            return this.randomDelay(context);
        }

        context.next();
    }

    private fixedDelay(context: SimulatorContext<DelayData>): any {
        let fixedDelaySettings: FixedDelay = (context.settings as any) as FixedDelay;
        this.log("FixedDelay", `delaying for ${fixedDelaySettings.delay}ms`)
        return setTimeout(context.next, fixedDelaySettings.delay);
    }

    private randomDelay(context: SimulatorContext<DelayData>): any {
        let randomDelaySettings: RandomDelay = (context.settings as any) as RandomDelay;
        let delay: number = randomBetween(randomDelaySettings.from, randomDelaySettings.to);
        this.log("RandomDelay", `delaying for ${delay}ms`)
        return setTimeout(context.next, delay);
    }    

    private chunked(context: SimulatorContext<DelayData>): void {
        let chunkDribbleDelaySettings: ChunkedDribbleDelay = (context.settings as any) as ChunkedDribbleDelay;
        this.log("ChunkDribble", `dribbling response of ${chunkDribbleDelaySettings.numberOfChunks} chunks over ${chunkDribbleDelaySettings.duration}ms`)
        return this.chunkDribble.dribble(context);
    }
}


interface FunctionCallback {
    (chunkIndex: number): Promise<void>
}

class ChunkDribble {

    constructor() { }

    dribble(context: SimulatorContext<DelayData>): void {
        
        let chunkDribbleDelaySettings: ChunkedDribbleDelay = (context.settings as any) as ChunkedDribbleDelay;

        this.setChunkedResponse(context.res);
        
        let chunks = (context.body as Object).chunkIt(chunkDribbleDelaySettings.numberOfChunks);

        if(!chunks || chunks.length <= 0)
            return context.next();

        chunks = chunks.reverse();

        this.internalDribble(chunkDribbleDelaySettings.numberOfChunks - 1, (chunkIndex) => {

            let currentChunk = (chunks as string[])[chunkIndex] ? (chunks as string[])[chunkIndex]: null;

            if(!currentChunk)
                return Promise.resolve();

            try {
                context.res.write(currentChunk);
            } catch(e) {
                context.res.end();
            }
            
            return Promise.resolve();

        }, this.getInterval(chunkDribbleDelaySettings), context.res);
    }

    private internalPause(duration: number): Promise<any> {
        return new Promise((res) => setTimeout(res, duration));
    }

    private internalDribble(chunks: number, fn: FunctionCallback, interval: number, res: SimulatorResponse): Promise<any> {
        return fn(chunks).then(() =>
            chunks > 0
                ? this.internalPause(interval).then(() => this.internalDribble(chunks - 1, fn, interval, res)) 
                : res.end());
    }

    private getInterval(settings: ChunkedDribbleDelay): number {
        return Math.floor(settings.duration / settings.numberOfChunks);
    }

    private setChunkedResponse(res: SimulatorResponse): SimulatorResponse {
        res.set("Transfer-Encoding", "chunked");
        res.set("Content-Type", "text/event-stream");
        return res;
    }

}