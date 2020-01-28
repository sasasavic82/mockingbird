import {
    handleCors,
    handleBodyRequestParsing,
    handleCompression,
    handleTimeout
} from "./common";

export default [
    handleTimeout,
    handleCors,
    handleBodyRequestParsing,
    handleCompression,
];