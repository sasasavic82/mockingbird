import { Request, Response, NextFunction } from "express";
import {
    IncomingData, ExtendableSettings, ISimulation, SimulatorResponse,
    SimulatorRequest, NextSimulator, SimulationConfig, SimulatorContext,
    SimulatorContextCallback, ProbabilityResponse,
    SimulatorIndex, SelectorHandler
} from "./common/types";

import { maybeWithDefault } from "../utils/tools";
import chalk from "chalk";

// Monkeypatch console.log
const logger = console.log;
const NEW_LINE = "\n";

/**
 * Abstract BaseSimulator class
 * 
 * This is where all the magic happens before we propagate the requests down to the simulation layers.
 * Every request will come through this class first, before the calls propagate to the instantiating class
 * via the `abstract evaluate` function.
 * 
 */
export abstract class BaseSimulator<T> implements ISimulation {

    public namespace: string;
    protected config: SimulationConfig;

    constructor(config: SimulationConfig) {
        this.config = config;
        this.namespace = config.namespace;

        /**
         * Set the defaults
         */
        this.config.debug = maybeWithDefault(this.config.debug)(true)
        this.log("initialize", `loaded ${this.constructor.name} simulator`);
    }

    /**
     * ingest implementation
     * 
     * TODO: This will need to be cleaned up a little.
     * 
     * @param req SimulatorRequest handler which holds the client request context
     * @param res SimulatorResponse handler which holds the client response context
     * @param next NextSimulator callback which we need to call if we want to progress to the next layer, unless the simulator ends the request prematurely
     */
    ingest(req: SimulatorRequest, res: SimulatorResponse, next: NextSimulator): any {

        let incomingData: IncomingData = res.locals as IncomingData;
        let settings: ExtendableSettings<T> = this.castSettings(incomingData.settings);

        if (!settings || !settings.simulators)
            return next();

        let selector: SelectorHandler<T> = () => {
            return (settings.simulators as SimulatorIndex<T>)[this.config.namespace] as T;
        }

        let context: SimulatorContext<T> = this.contextualize(incomingData.body, selector, req, res, next);


        if (!context.settings)
            return next();

        this.log("ingest", "found " + chalk.blue(`${this.constructor.name} simulator`));
        /**
        * Shall we fail or not? Let's roll the dice :)
        */
        if (this.generateFailure(settings.failureProbability).passed)
            return next();


        this.log("evaluate", "processing " + chalk.blue(`${this.constructor.name} simulator`));

        /**
         * Call children
         */
        this.evaluate(context, (context) => next());
    }

    protected castSettings(globalSettings: any): ExtendableSettings<T> {
        let settings: ExtendableSettings<T> = (globalSettings as ExtendableSettings<T>);
        return settings;
    }

    /**
     * We call this function to create our simulator context with all of the necessary properties
     * which enable us visibility into the request data, settings and request/resoonse handlers.
     * 
     * @param body the request body
     * @param globalSettings global settings from the main request body
     * @param req SimulatorRequest
     * @param res SimulatorResponse
     * @param next NextSimulator
     */
    //private contextualize(body: any, globalSettings: ExtendableSettings<T>, req: SimulatorRequest, res: SimulatorResponse, next: NextSimulator): SimulatorContext<T> {
    protected contextualize(body: any, selector: SelectorHandler<T>, req: SimulatorRequest, res: SimulatorResponse, next: NextSimulator): SimulatorContext<T> {

        /**
         * We extract the settings property associated with the simulation layer
         */
        let context: T = selector();

        return {
            body: body,
            settings: context,
            next: next,
            req: req,
            res: res
        };
    }

    /**
     * Function that generates the occurence of a failure based on `probabilityOfFailure.
     * 
     * Example: Probability of 0.2 indicates 20% chance of failure
     * 
     * @param probabilityOfFailure failure probability value between 0.0 - no failure to 1.0 - certain failure.
     */
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

    /**
     * Pretty logging
     * 
     * @param section what section are you currently in
     * @param message the message
     * @param newLine whether we want to have a line separator between stdout outputs
     */
    protected log(section: string, message: string, newLine?: boolean) {

        if (newLine)
            logger(NEW_LINE);

        if (this.config.debug)
            logger(chalk.red(`simulator[`) + chalk.white(`${this.constructor.name}:${this.namespace}:${section}`) + chalk.red(`] `) + chalk.yellow(`${message}`));
    }

    /**
     * Every simulation layer must implement the `evaluate` method. Here, we use "chain of responsibility" pattern
     * where the parent (base class) calls the child to run (evaluate) the failure simulation
     * 
     * @param context simulation context associated with the request
     * @param callback optional callback function to the abstract base class
     */
    protected abstract evaluate(context: SimulatorContext<T>, callback?: SimulatorContextCallback<T>): void;

}