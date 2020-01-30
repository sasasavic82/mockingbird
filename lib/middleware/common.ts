import { Router, Request, Response } from "express";
import cors from "cors";
import parser from "body-parser";
import compression from "compression";
import timeout from "connect-timeout";

function shouldCompress(req: Request, res: Response) {
    if(req.headers["x-mockingbird-fake-compression"])
        return false;
    return compression.filter(req, res);
}

export const handleCors = (router: Router) => router.use(cors({ credentials: true, origin: true }));

export const handleBodyRequestParsing = (router: Router) => {
    router.use(parser.urlencoded({extended: true}));
    router.use(parser.json());
}

export const handleCompression = (router: Router) => {
    router.use(compression({
       filter: shouldCompress
    }));
}

export const handleTimeout = (router: Router) => {
    router.use(timeout("59s"));
}