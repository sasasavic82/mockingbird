

import { randomBetween } from "../../../../../utils/tools"
import chalk from "chalk";

const log = console.log;

const removeRandomArray = (data: Array<any>): Array<any> => {
    data.splice(randomBetween(0, data.length - 1), 1);
    return data;
}

const removeRandomProperty = (data: any): any => {
    delete data[
        Object.keys(data)[
            randomBetween(0, Object.keys(data).length -1)]];

    return data;
}

export default (body: any[] | any): any[] | any | undefined => {
    log("------ " + chalk.red.bgWhite.bold("headers: random remove") + " ------")
    if(Array.isArray(body))
        return removeRandomArray(body);
    else 
        return removeRandomProperty(body);
}