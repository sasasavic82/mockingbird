import { Request, Response, NextFunction } from "express";
import { SourceLayer } from "../extesions/source";

export enum MockingResult {
    Success = "success",
    Failure = "failure"
}

export interface Indexed {
    [key: string]: any
}

export interface ProxySettings {
    uri: string
    headers?: Indexed,
    qs?: Indexed,
    [key: string]: any;
}

export interface StoreSettings {
    storeKey: string,
    query?: string
}

export enum SourceTypes {
    Http = "http",
    Store = "store",
    Body = "body"
}

export interface SourceDescription {
    type: SourceTypes | string,
    settings?: ProxySettings | StoreSettings
}

export interface ExtendableSettings<T> {
    failureProbability: number,
    source?: SourceDescription,
    //executionOrder: Array | String,
    simulators?: SimulatorIndex<T>
}

export interface DataIndex<T> {
    [key: string]: T | T[]
}

/**
 * Describes the simulator collection
 */
export interface SimulatorIndex<T> {
    [key: string]: T | any
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
    CREATED = 201,
    ACCEPTED = 202,
    BAD_REQUEST = 400,
    NOT_FOUND = 404
}

export interface EngineConfig {
    sourceLayer?: SourceLayer;
    debug?: boolean
}

export interface SimulationConfig {
    namespace: string,
    debug?: true
}

export type SelectorHandler<T> = {
    (): T
}

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

//export type NextSimulator = NextFunction;
export interface NextSimulator extends NextFunction {}
//export type SimulatorRequest = Request;
export interface SimulatorRequest extends Request {}
//export type SimulatorResponse = Response;
export interface SimulatorResponse extends Response {}

export interface SimulatorContextCallback<T> {
    (context?: SimulatorContext<T>): void
}