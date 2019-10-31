
import { Request, Response, NextFunction } from "express";

import { IncomingData, ExtendableSettings, ISimulation, SimulatorResponse, 
    SimulatorRequest, NextSimulator, SimulationConfig, SimulatorContext, 
    SimulatorContextCallback, ProbabilityResponse, IDisposable, SimulationHandler, ResponseStatus } from "./types";

import { SimulatorExistsError } from "./errors";

import { maybeWithDefault } from "../../utils/tools";

import chalk from "chalk";
const logger = console.log;


export abstract class BaseSimulator<T> implements ISimulation {

    public namespace: string;

    protected config: SimulationConfig;

    constructor(config: SimulationConfig) {
        this.config = config;
        this.namespace = config.namespace;

        this.config.debug = maybeWithDefault(this.config.debug)(true)

        this.log("initialize", `Loaded ${this.constructor.name} simulator`);
    }

    ingest(req: SimulatorRequest, res: SimulatorResponse, next: NextSimulator): any {

        console.log("")

        this.log("ingest", `Processing in ${this.constructor.name}`);

        let incomingData: IncomingData = res.locals as IncomingData;

        let settings: ExtendableSettings<T> = this.castSettings(incomingData.settings);

        if(this.passed(settings.failurePercentage).passed)
            return next();

        let context: SimulatorContext<T> = this.contextualize(incomingData.body, settings, req, res, next);

        if(context.settings == undefined)
            return next();

        this.evaluate(context, (context) => {
            return next();
        });
    }

    private castSettings(globalSettings: any) : ExtendableSettings<T>  {
        let settings: ExtendableSettings<T> = (globalSettings as ExtendableSettings<T>);
        return settings;
    }

    private contextualize(body: any, globalSettings: ExtendableSettings<T>, req: SimulatorRequest, res: SimulatorResponse, next: NextSimulator): SimulatorContext<T> {

        let settings: ExtendableSettings<T> = globalSettings;
        let context: T = settings[this.config.namespace] as T;
        
        return {
            body: body,
            settings: context,
            next: next,
            req: req,
            res: res
        };
    }

    private passed(probabilityOfFailure: number | undefined): ProbabilityResponse {

        if(probabilityOfFailure == undefined)
            probabilityOfFailure = 0;
        
        let random: number = Math.random();
        let hasPassed: boolean = random >= probabilityOfFailure
    
        this.log("probability", chalk.yellow(`${probabilityOfFailure}`) + `, ${hasPassed ? chalk.green.bold("passed") : chalk.red.bold("failed")}`)
    
        return {
            random: random,
            passed: hasPassed
        }
    }

    protected log(section: string, message: string) {
        if(this.config.debug)
            logger(chalk.red(`simulator[`) + chalk.white(`${this.constructor.name}:${this.namespace}:${section}`) + chalk.red(`] `) + chalk.yellow(`${message}`));
    }

    protected abstract evaluate(context: SimulatorContext<T>, callback?: SimulatorContextCallback<T>): void;

}

/**

 */

export class MockingEngine implements ISimulation {

    public namespace: string = "mockingengine";

    protected simulatorLayers: ISimulation[] = [];

    constructor() {
        this.simulatorLayers = this.internalLoadSimulators();
    }

    public loadSimulators(simulators: ISimulation | ISimulation[]): IDisposable[] {

        if(!Array.isArray(simulators)) {
            return [
                this.internalLoad(simulators as ISimulation)
            ];
        };

        return (simulators as ISimulation[]).map((simulator) => {
            return this.internalLoad(simulator);
        });

    }

    private internalLoad(simulator: ISimulation): IDisposable {

        this.simulatorLayers.forEach((layer) => {
            if(layer.namespace === simulator.namespace)
                throw new SimulatorExistsError(`Simulator ${simulator.namespace} already exists in the namespace.`);
        });

        let lastSimulator = this.simulatorLayers.pop();
        this.simulatorLayers.push(simulator);

        if(lastSimulator)
            this.simulatorLayers.push(lastSimulator);

        return {
            dispose: () => this.unloadSimulator(simulator)
        };
    }

    public unloadSimulator(simulator: ISimulation): void {
        let simIndex = this.simulatorLayers.indexOf(simulator);
        if (simIndex > -1)
            this.simulatorLayers.splice(simIndex, 1);
    }

    public getSimulatorHandlers(): SimulationHandler[] {
        return this.simulatorLayers.map((simulator) => {
            return (req: Request, res: Response, next: NextFunction): void =>
                simulator.ingest(req, res, next);
        });
    }

    public ingest(req: Request, res: Response, next: NextFunction): any {

        if (!req.body.settings)
            return res.status(ResponseStatus.OK).send(req.body);

        const parseIncomingData = (body: any): IncomingData => {
            return {
                body: body.body,
                settings: body.settings as ExtendableSettings<any>
            };
        }

        res.locals = parseIncomingData(req.body);

        next();
    }

    private internalLoadSimulators(): ISimulation[] {

        let defaultEndSimulatorHandler: SimulationHandler = 
            (req: SimulatorRequest, res: SimulatorResponse): any => {
                let incomingData = res.locals as any as IncomingData;
                res.status(200).send(incomingData.body);
        };

        let defaultEndSimulator: ISimulation = {
            namespace: "final-handler",
            ingest: defaultEndSimulatorHandler,
        };

        return [this, defaultEndSimulator];
    }

}