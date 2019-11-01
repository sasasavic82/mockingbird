
import { Request, Response, NextFunction } from "express";
import {
    IncomingData, ExtendableSettings, ISimulation, SimulatorResponse,
    SimulatorRequest, NextSimulator, SimulationConfig, SimulatorContext,
    SimulatorContextCallback, ProbabilityResponse, IDisposable, SimulationHandler, ResponseStatus
} from "./common/types";
import { SimulatorExistsError } from "./common/errors";
import { maybeWithDefault } from "../utils/tools";
import chalk from "chalk";

// Monkeypatch console.log
const logger = console.log;

const NEW_LINE = "\n";

export abstract class BaseSimulator<T> implements ISimulation {

    public namespace: string;
    protected config: SimulationConfig;

    constructor(config: SimulationConfig) {
        this.config = config;
        this.namespace = config.namespace;

        // set the defaults
        this.config.debug = maybeWithDefault(this.config.debug)(true)
        this.log("initialize", `loaded ${this.constructor.name} simulator`);
    }

    ingest(req: SimulatorRequest, res: SimulatorResponse, next: NextSimulator): any {

        this.log("ingest", "entering " + chalk.blue(`${this.constructor.name} simulator`));

        let incomingData: IncomingData = res.locals as IncomingData;
        let settings: ExtendableSettings<T> = this.castSettings(incomingData.settings);

        if (this.generateFailure(settings.failureProbability).passed)
            return next();

        let context: SimulatorContext<T> = this.contextualize(incomingData.body, settings, req, res, next);

        if (context.settings == undefined)
            return next();


        this.log("evaluate", "processing " + chalk.blue(`${this.constructor.name} simulator`));

        // Call children
        this.evaluate(context, (context) => next());
    }

    private castSettings(globalSettings: any): ExtendableSettings<T> {
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

    private generateFailure(probabilityOfFailure: number | undefined): ProbabilityResponse {

        if (probabilityOfFailure == undefined)
            probabilityOfFailure = 0;

        let random: number = Math.random();
        let hasPassed: boolean = random >= probabilityOfFailure

        if (!hasPassed)
            this.log("probability", chalk.green("probability of failure occured... simulating failure"));

        return {
            random: random,
            passed: hasPassed
        }
    }

    protected log(section: string, message: string, newLine?: boolean) {

        if(newLine)
            logger(NEW_LINE);

        if (this.config.debug)
            logger(chalk.red(`simulator[`) + chalk.white(`${this.constructor.name}:${this.namespace}:${section}`) + chalk.red(`] `) + chalk.yellow(`${message}`));
    }

    protected abstract evaluate(context: SimulatorContext<T>, callback?: SimulatorContextCallback<T>): void;

}

export class MockingEngine implements ISimulation {

    public namespace: string = "mockingengine";
    protected simulatorLayers: ISimulation[] = [];

    constructor() {
        this.simulatorLayers = this.internalLoadSimulators();
    }

    public loadSimulators(simulators: ISimulation | ISimulation[]): IDisposable[] {

        if (!Array.isArray(simulators))
            return [this.internalLoad(simulators as ISimulation)];

        return (simulators as ISimulation[]).map((simulator) => this.internalLoad(simulator));
    }

    private internalLoad(simulator: ISimulation): IDisposable {

        /*
        * Iterate through all simulation layers, checking if there is already an existing layer
        * NOTE: This constrain will need to be lifted, once we allow extending simulator interfaces
        * such that we can merge two simulator namespaces.
        */
        this.simulatorLayers.forEach((layer) => {
            if (layer.namespace === simulator.namespace)
                throw new SimulatorExistsError(`Simulator ${simulator.namespace} already exists in the namespace.`);
        });

        /*
        * We pop out the last layer and make sure we re-insert it once we add a new layer.
        * Last layer (final-handler) must remain at the bottom of the stack as it is the
        * final HTTP client response point (unless previous layers complete the HTTP request
        * due to simulation execution that may cause a client response)
        */
        let lastSimulator = this.simulatorLayers.pop();
        this.simulatorLayers.push(simulator);

        if (lastSimulator)
            this.simulatorLayers.push(lastSimulator);

        /** 
        * Give the caller an opportunity to removea layer.
        */
        return {
            dispose: () => this.unloadSimulator(simulator)
        };
    }

    public unloadSimulator(simulator: ISimulation): void {
        let simIndex = this.simulatorLayers.indexOf(simulator);
        if (simIndex > -1)
            this.simulatorLayers.splice(simIndex, 1);
    }

    /**
     * This function is used to export out all of the layer handlers.
     * The handlers are then imported into express route.
     * 
     * @returns SimulationHandler[]
     */

    public getSimulatorHandlers(): SimulationHandler[] {
        return this.simulatorLayers.map((simulator) => {

            /**
             * We are returning `simulator.ingest(req, res, next)` as a `SimulationHandler`
             * wrapper. This is required so thtt we don't lose context of the child `class` that
             * inherits the `ISimulation` interface.
             */
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

    /**
     * Load all simulators. This is an internal function.
     * NOTE: this function should dynamically load all of the simulators
     * that live in the `simulators` folder.
     */
    private internalLoadSimulators(): ISimulation[] {

        /**
         * We are injecting a `final-handler`, as we need to make sure
         * we exit the simulation middleware stack gracefully if all
         * simulations pass (by `pass`, it means the simulation failure
         * did not execute due to probability)
         * 
         * @param req SimulatorRequest Request context
         * @param res SimulatorResponse Response context
         */
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