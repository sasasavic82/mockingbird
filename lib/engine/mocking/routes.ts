import { Request, Response, NextFunction } from "express";
import { MockingEngine } from "./mockEngine";
import { IncomingData } from "./types";
import plugins from './plugins';

export default [
  {
    path: "/api/v1/mock",
    method: "post",
    handler: [
      ...plugins,
      async (req: Request, res: Response) => {
        let incomingData = res.locals as any as IncomingData;

        
        console.log(res.getHeaders());
        console.log(incomingData.body);
        

        //console.log(JSON.stringify(incomingData.body, null, 2));

        res.status(200).send(incomingData.body);
      }
    ]
  }
];