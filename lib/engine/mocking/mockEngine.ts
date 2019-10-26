import { Request } from "../../utils/serviceTypes"
import { Response, IncomingData, ProcessedResponse, MockingResult } from "./types";


export class MockingEngine {
    constructor() { }

    public ingest(incoming: Request<IncomingData>): Promise<Response<ProcessedResponse>> {

        let data: ProcessedResponse = {
            headers: [{
                key: "x-auth",
                value: "abc123"
            }],
            body: incoming.request.body
        }

        let response: Response<ProcessedResponse> = {
            result: "success",
            response: data
        }

        return Promise.resolve(response);
    }
}