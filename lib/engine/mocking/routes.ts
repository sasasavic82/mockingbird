
import { MockingEngine } from "./mockEngine";
import { EmptySimulator, DelaySimulator, ConnectionSimulator, HeaderSimulator, BodySimulator } from "./simulators";

let engine: MockingEngine = new MockingEngine();

engine.loadSimulators([
  new EmptySimulator({ namespace: "empty" }),
  new DelaySimulator({ namespace: "delay"}),
  new ConnectionSimulator({ namespace: "connection" }),
  new HeaderSimulator({ namespace: "header" }),
  new BodySimulator({ namespace: "body" })]
);

export default [
  {
    path: "/api/v1/mock",
    method: "post",
    handler: [...engine.getSimulatorHandlers()]
  }
];