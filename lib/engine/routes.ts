import { Request, Response } from "express";
import { MockingEngine } from "./mocking/mockEngine";
import { Request as IncomingRequest } from "../utils/serviceTypes"
import { Settings, IncomingData } from "./mocking/types";

let mocking = new MockingEngine();

export default [
  {
    path: "/api/v1/settings",
    method: "post",
    handler: [
      // TOOD: You will need the request and response from the original.
      async ({ body }: Request, res: Response) => {

        let request =
          new IncomingRequest<Settings>(body as any as Settings)

        const result = await mocking.settings(request);

        console.log(JSON.stringify(result, null, 2));

        res.status(200).send(result);
      }
    ]
  },
  {
    path: "/api/v1/mock",
    method: "post",
    handler: [
      //checkSearchParams,
      // TOOD: You will need the request and response from the original.
      async (req: Request, res: Response) => {

        const incomingData: IncomingData = {
          response: res,
          request: req
        };

        let request =
          new IncomingRequest<IncomingData>(incomingData)

        const result = await mocking.ingest(request);

        console.log(JSON.stringify(result, null, 2));

        res.status(200).send(result);
      }
    ]
  }
];