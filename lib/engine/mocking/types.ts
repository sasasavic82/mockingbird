import { KeyValue } from "../../utils/serviceTypes";
import { Request, Response, NextFunction } from "express";

//export type MockingResult = "success" | "failure";

export enum MockingResult {
    Success = "success",
    Failure = "failure"
}

export interface ExtendableSettings<T> {
    failurePercentage: number,
    [key: string]: T | any;
}

export type IncomingData = {
    body: any | object,
    readonly settings: ExtendableSettings<any>
}


/**
 * @enum ResponseStatus
 * These are associated with the HTTP Response codes that we pass on
 * to the `express` response object.
 *
 * For more information, on status codes:
 * @see: https://en.wikipedia.org/wiki/List_of_HTTP_status_codes
 */
export enum ResponseStatus {
    OK = 200,
    CREATED = 201
}


export interface SimulationConfig {
    namespace: string,
    debug?: true
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