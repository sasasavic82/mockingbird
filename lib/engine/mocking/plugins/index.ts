import nothing from "./nothing";
import validate from "./validate";
import headers from "./headers";
import delay from "./delay";
import body from "./body";

export default [
    ...nothing,
    ...validate,
    ...headers,
    ...body,
    ...delay
]