import { Request, Response, NextFunction } from "express";
import {
    IncomingData, ExtendableSettings, ISimulation, SimulatorResponse,
    SimulatorRequest, NextSimulator,IDisposable, SimulationHandler, 
    ResponseStatus
} from "./common/types";
import { SourceLayer } from "./extesions/source";
import { SimulatorExistsError } from "./common/errors";

/**
 * Place where we load/unload simulators. It is also the primary entry-point for all requests.
 */
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

        /**
         * TODO: YOU MUST GET RID OF THE SECOND && THIRD CONDITION THAT CHECKS FOR SIMULATORS
         * THE NEXT LAYER AFTER THIS INITIAL LAYER WILL DETERMINE IF THERE ARE SOURCES THEN
         * IF WE NEED TO RUN FAULT SIMULATION
         */

        if (!req.body.settigs && !req.body.body)
            return res.status(ResponseStatus.BAD_REQUEST).send({ error: "Supply body or settings property" })

        if (req.body.settings && /*!req.body.settings.source ||*/ !req.body.settings.simulators)
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

        let sourceInstance: SourceLayer = new SourceLayer({
            "sash": {
                "name": "Sash"
            }
        });

        let sourceHandler: SimulationHandler =
            (req: SimulatorRequest, res: SimulatorResponse, next: NextSimulator): any => sourceInstance.ingest(req, res, next);
                   
        /**
         * default `final-handler` definition
         */
        let source: ISimulation = {
            namespace: "source-layer",
            ingest: sourceHandler,
        };

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

        /**
         * default `final-handler` definition
         */
        let defaultEndSimulator: ISimulation = {
            namespace: "final-handler",
            ingest: defaultEndSimulatorHandler,
        };

        /**
         * Here we load two default simulation middleware layers.
         * `this` layer is MockingEngine layer, responsible for taking the first request.
         * `defaultEndSimulator`, if ever reached, completes the request - returning a 200 and the body of the
         * initial response.
         */
        return [
            this,
            source,
            defaultEndSimulator];
    }

}