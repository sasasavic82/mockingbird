import { Router, Request, Response, NextFunction } from "express";

type Wrapper = ((router: Router) => void);

export const buildMiddleware = (
    middlewareWrappers: Wrapper[],
    router: Router
) => {
    for(const wrapper of middlewareWrappers) {
        wrapper(router);
    }
}

export type SimulatorHandler = (
    req: Request,
    res: Response,
    next: NextFunction
) => Promise<void> | void;

export type SimulatorRoute = {
    path: string,
    method: string,
    handler: SimulatorHandler | SimulatorHandler[]
};

export const buildRoutes = (routes: SimulatorRoute[], router: Router) => {
    for(const route of routes) {
        const { method, path, handler } = route;
        (router as any)[method](path, handler);
    }
}