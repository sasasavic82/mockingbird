import { KeyValue } from "../../utils/serviceTypes";

export type MockingResult = "success" | "failure";

export type DelayType = "lognormal" | "uniform" | "chunked_dribble" | "fixed";

export type FaultTypes = "empty_response" | "malformed_response" | "random_data_response" | "connection_reset_by_peer";

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

export type Settings = {
    successPercentage?: number,
    permutateBody?: boolean,
    permutateHeaders?: boolean,
    fault?: FaultTypes,
    delay?: LognormalDelay | UniformDelay | ChunkedDribbleDelay | FixedDelay
}

export type IncomingData = {
    headers?: KeyValue<string, string>[],
    body?: any | object,
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