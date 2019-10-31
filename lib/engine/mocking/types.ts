import { KeyValue } from "../../utils/serviceTypes";
import { Request, Response, NextFunction } from "express";

//export type MockingResult = "success" | "failure";

export enum MockingResult {
    Success = "success",
    Failure = "failure"
}



export enum Operation {
    Random = "random",
    All = "all",
    None = "none"
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




export interface ExtendableSettings<T> {
    failurePercentage: number,
    [key: string]: T | any;
}

export type IncomingData = {
    body: any | object,
    settings: ExtendableSettings<any>
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
