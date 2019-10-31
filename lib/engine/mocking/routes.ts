import { Request, Response, NextFunction } from "express";
import { IncomingData } from "./types";
import { MockingEngine, SimulationConfig } from "./mockEngine";
import plugins from './plugins';

import { EmptySimulator, DelaySimulator, ConnectionSimulator, HeaderSimulator } from "./simulators";

let engine: MockingEngine = new MockingEngine();

engine.loadSimulator([
  new EmptySimulator({ namespace: "empty" }),
  new DelaySimulator({ namespace: "delay"}),
  new ConnectionSimulator({ namespace: "connection" }),
  new HeaderSimulator({ namespace: "header" })]
);

export default [
  {
    path: "/api/v1/mock",
    method: "post",
    handler: [
      //...plugins,
      ...engine.getSimulatorHandlers(),
      async (req: Request, res: Response, next: NextFunction) => {

        //engine.begin(req, res, next);

        let incomingData = res.locals as any as IncomingData;

        
        //console.log(res.getHeaders());
        //console.log(incomingData.body);
        

        //console.log(JSON.stringify(incomingData.body, null, 2));



        res.status(200).send(incomingData.body);
      }
    ]
  }
];