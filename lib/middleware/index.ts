import {
    handleCors,
    handleBodyRequestParsing,
    handleCompression
} from "./common";

import serverErrors from "./errorHandlers";

export default [
    ...serverErrors,
    handleCors,
    handleBodyRequestParsing,
    handleCompression,
];