
import http from "http";
import express from "express";

import { buildMiddleware, buildRoutes, SimulatorRoute } from "./utils";
import middleware from "./middleware";
import errorHandlers from "./middleware/errorHandlers";
import { MockingEngine } from "./engine/mockEngine";

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
}

export class MockingServer {

    private router: any;
    private server: http.Server;

    constructor(private config: ServerConfig) {
        this.router = express();
        this.initialiseMiddlewareAndRoutes();
        this.server = http.createServer(this.router);
    }

    private initialiseMiddlewareAndRoutes(): void {
        buildMiddleware(middleware, this.router);
        buildRoutes(this.initialiseMockingRoute(), this.router);
        buildMiddleware(errorHandlers, this.router);
    }

    private initialiseMockingRoute(): SimulatorRoute[] {
        return [
            {
                path: "/api/v1/mock",
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
}