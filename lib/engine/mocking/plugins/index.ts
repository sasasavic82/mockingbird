import nothing from "./nothing";
import validate from "./validate";
import headers from "./headers";
import delay from "./delay";
import body from "./body";
import connection from "./connection";

export default [
    ...nothing,
    ...validate,
    ...connection,
    ...headers,
    ...body,
    ...delay
]