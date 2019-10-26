import { Request, Response } from "express";
import { MockingEngine } from "./mocking/mockEngine";
import { Request as IncomingRequest } from "../utils/serviceTypes"
import { IncomingData } from "./mocking/types";

let mocking = new MockingEngine();

export default [
    {
      path: "/api/v1/mock",
      method: "post",
      handler: [
        async ({ body }: Request, res: Response) => {
          let request = 
            new IncomingRequest<IncomingData>(body as any as IncomingData)

          const result = await mocking.ingest(request);
          
          console.log(JSON.stringify(result, null, 2));

          res.status(200).send(result);
        }
      ]
    }
  ];