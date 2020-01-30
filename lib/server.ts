
import https from "https";
import http from "http";
import express from "express";

import { buildMiddleware, buildRoutes, SimulatorRoute } from "./utils";
import middleware from "./middleware";
import errorHandlers from "./middleware/errorHandlers";
import { MockingEngine } from "./engine/mockEngine";
import { BodySimulator } from "./engine/simulators";
import { SimulationHandler, SimulatorRequest, SimulatorResponse, NextSimulator } from "./engine/common/types";
import { SecureContextOptions } from "tls";

let defaultHandler: SimulationHandler = (req: SimulatorRequest, res: SimulatorResponse, next: NextSimulator): any => res.status(501);

process.on("uncaughtException", e => {
    console.log(e);
    process.exit(1);
});

process.on("unhandledRejection", e => {
    console.log(e);
    process.exit(1);
});

export interface ServerConfig {
    port: number | string,
    debug?: boolean,
    engine: MockingEngine
    secureContextOptions?: SecureContextOptions
}

export class MockingServer {

    private router: any;
    private server: http.Server | https.Server; // net.Server;

    constructor(private config: ServerConfig) {
        this.router = express();
        this.initialiseMiddlewareAndRoutes();
        
        this.server = this.config.secureContextOptions ?
            https.createServer(this.config.secureContextOptions, this.router) :
            http.createServer(this.router);

        this.server.keepAliveTimeout = 61 * 1000;
        this.server.headersTimeout = 65 * 1000;
    }

    private initialiseMiddlewareAndRoutes(): void {
        buildMiddleware(middleware, this.router);
        buildRoutes(this.initialiseMockingRoute(), this.router);
        buildMiddleware(errorHandlers, this.router);
    }

    private initialiseMockingRoute(): SimulatorRoute[] {

        let bodyInstance = this.mockingEngineInstance().getSimulatorHandler<BodySimulator>("body");

        let largeFileHandler: SimulationHandler = bodyInstance ?
            (req: SimulatorRequest, res: SimulatorResponse, next: NextSimulator): any => (bodyInstance as BodySimulator).largeFilesHandler(req, res, next) :
            defaultHandler;

        return [
            {
                path: "/api/v1/mock",
                method: "post",
                handler: [...this.mockingEngineInstance().getSimulatorHandlers()]
            },
            {
                path: "/api/v1/mock/download",
                method: "get",
                handler: largeFileHandler
            },
            {
                path: "/healthcheck",
                method: "get",
                handler: (req: express.Request, res: express.Response): Promise<void> | void => {
                    res.status(200).json({ health: "OK" });
                }
            },
            {
                path: "*",
                method: "post",
                handler: [...this.mockingEngineInstance().getSimulatorHandlers()]
            }
        ]
    }

    mockingEngineInstance(): MockingEngine {
        return this.config.engine;
    }

    startService() {

        this.server.listen(this.config.port, () => {
            console.log(`🕊️ mockingbird 🕊️ server is running http://localhost:${this.config.port}...`);
        });

    }

    stopService() {
        try {
            this.server.close();
        } catch (e) {
            console.log(e);
        }
    }
}