
import http from "http";
import express from "express";

import { buildMiddleware, buildRoutes } from "./utils";
import middleware from "./middleware";
import errorHandlers from "./middleware/errorHandlers";
import routes from "./engine";

process.on("uncaughtException", e => {
    console.log(e);
    process.exit(1);
});

process.on("unhandledRejection", e => {
    console.log(e);
    process.exit(1);
});

const router = express();

buildMiddleware(middleware, router);
buildRoutes(routes, router);
buildMiddleware(errorHandlers, router);

const { MOCKINGBIRD_SERVICE_PORT = 4444 } = process.env;
const server = http.createServer(router);

server.listen(MOCKINGBIRD_SERVICE_PORT, () => {
    console.log(`Testrig Mock server is running http://localhost:${MOCKINGBIRD_SERVICE_PORT}...`); 
});