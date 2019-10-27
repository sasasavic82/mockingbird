import { KeyValue } from "../../utils/serviceTypes";
import { Request, Response } from "express";

export type MockingResult = "success" | "failure";

export type DelayType = "lognormal" | "uniform" | "chunked_dribble" | "fixed";

export type FaultTypes = "no_fault" | "empty_response" | "malformed_response" | "random_data_response" | "connection_reset_by_peer";

export type LognormalDelay = {
    median: number, // 90
    sigma: number // 0.1
}

export type UniformDelay = {
    lower: number, // 15
    upper: number // 25
}

export type ChunkedDribbleDelay = {
    numberOfChunks: number, // 5
    duration: number // 1000
}
export type FixedDelay = {
    fixedDelay?: number // 1000
}

export type HeaderSettings = {
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
    fault?: FaultTypes,
    delay?: LognormalDelay | UniformDelay | ChunkedDribbleDelay | FixedDelay
}

export type IncomingData = {
    request: Request,
    response: Response
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

