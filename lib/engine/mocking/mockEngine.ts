
import { Request, Response, NextFunction } from "express";
import { IncomingData, ExtendableSettings } from "./types";
import { SimulatorExistsError } from "./errors";
import chalk from "chalk";

const logger = console.log;

/**
 * @enum ResponseStatus
 * These are associated with the HTTP Response codes that we pass on
 * to the `express` response object.
 *
 * For more information, on status codes, see: https://en.wikipedia.org/wiki/List_of_HTTP_status_codes
 */
export enum ResponseStatus {
    OK = 200,
    CREATED = 201
}


export interface SimulationConfig {
    namespace: string
}

// ------- awesome code ------

/**
 * @type SimulationHandler
 * SimulationHandler type is a function-describing type that maps to 
 * `express` Request, Response and NextFunction objects.
 *
 * It handles the layer execution as the HTTP data comes through
 */
export type SimulationHandler = {
    (req: SimulatorRequest, res: SimulatorResponse, next: NextSimulator): any;
}

/**
 * @interface ISimulation
 * SimulationHandler interface is a function-describing interface that maps to 
 * `express` Request, Response and NextFunction objects.
 *
 * It handles the layer execution as the HTTP data comes through
 */
export interface ISimulation {
    namespace: string,
    ingest: SimulationHandler;
}

/**
 * @interface IDisposable
 * We may want to remove the interface from the interface layer.
 */
export interface IDisposable {
    dispose(): void;
}

/**
 * @param T is the data type of the simulator-specific setting.
 * @interface SimulatorContext<T> 
 * We pass on the body and the simulator-specific settings as a type T
 * 
 * @example
 * 
 *  let settings = {
 *      injectRandomHeaders: true,
 *      permutateBody: true
 *  }
 */
export interface SimulatorContext<T> {
    body: any | object,
    settings: T,
    next: NextSimulator
    req: SimulatorRequest,
    res: SimulatorResponse
}

export type ProbabilityResponse = {
    random: number | undefined,
    passed: boolean
}

export type NextSimulator = NextFunction;
export type SimulatorRequest = Request;
export type SimulatorResponse = Response;

export interface SimulatorContextCallback<T> {
    (context?: SimulatorContext<T>): void
}

export abstract class BaseSimulator<T> implements ISimulation {

    public namespace: string;

    protected config: SimulationConfig;

    constructor(config: SimulationConfig) {
        this.config = config;
        this.namespace = config.namespace;
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
        logger(chalk.red(`simulator[`) + chalk.green(`${this.constructor.name}:${this.namespace}:${section}`) + chalk.red(`] `) + chalk.yellow(`${message}`));
    }

    protected abstract evaluate(context: SimulatorContext<T>, callback?: SimulatorContextCallback<T>): void;

}

/**
 * @param P  For most requests, this should be `ParamsDictionary`, but if you're
 * using this in a route handler for a route that uses a `RegExp` or a wildcard
 * `string` path (e.g. `'/user/*'`), then `req.params` will be an array, in
 * which case you should use `ParamsArray` instead.
 *
 * @see https://expressjs.com/en/api.html#req.params
 *
 * @example
 *     app.get('/user/:id', (req, res) => res.send(req.params.id)); // implicitly `ParamsDictionary`
 *     app.get<ParamsArray>(/user\/(.*)/, (req, res) => res.send(req.params[0]));
 *     app.get<ParamsArray>('/user/*', (req, res) => res.send(req.params[0]));
 */

export class MockingEngine implements ISimulation {

    public namespace: string = "mockingengine";

    protected simulatorLayers: ISimulation[] = [];

    constructor() {
        this.simulatorLayers = this.loadSimulators();
    }

    public loadSimulator(simulators: ISimulation | ISimulation[]): IDisposable[] {

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

        if (this.simulatorLayers.includes(simulator))
            throw new SimulatorExistsError(`Simulator ${simulator.namespace} already exists in the namespace.`);

        this.simulatorLayers.push(simulator);

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

    private loadSimulators(): ISimulation[] {
        return [this];
    }

}