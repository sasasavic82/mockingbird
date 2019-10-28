import { KeyValue } from "../../utils/serviceTypes";
import { Request, Response, NextFunction } from "express";

//export type MockingResult = "success" | "failure";

export enum MockingResult {
    Success = "success",
    Failure = "failure"
}

export enum DelayType {
    Lognormal = "lognormal",
    Uniform = "uniform",
    ChunkedDribble = "chunked_dribble",
    Fixed = "fixed"
}

export enum ConnectionFaultType {
    EmptyResponse = "empty_response",
    ConnectioResetByPeer = "connection_reset_by_peer"
}

export enum Operation {
    Random = "random",
    All = "all"
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

export type HeaderSettings = {
    operation: Operation,
    injectRandom?: boolean,
    permutate?: boolean
    extraHeaders?: KeyValue<string, string>[]
}

export type BodySettings = {
    randomRemove: boolean,
    randomContentType: boolean
}

export type Settings = {
    failurePercentage?: number,
    body?: BodySettings,
    headers?: HeaderSettings,
    connection?: ConnectionFaultType,
    delay?: LognormalDelay | UniformDelay | ChunkedDribbleDelay | FixedDelay
}

export type IncomingData = {
    body: any | object,
    settings: Settings
}

export type MockingError = {
    errorCode: string,
    description: string
}

export type ProcessedResponse = {
    headers: KeyValue<string, string>[],
    body: any | object
}

export type Response<T> = {
    result: MockingResult,
    response: T | MockingError
}

export type WrappedResponse<T> = {
    data: T,
    (req: Request, res: Response, next: NextFunction): void
}
