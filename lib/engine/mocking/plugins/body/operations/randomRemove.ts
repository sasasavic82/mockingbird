

import { randomBetween } from "../../../../../utils/tools"

const removeRandomArray = (data: Array<any>): Array<any> => {
    let random: number = randomBetween(0, data.length - 1);
    data = data.splice(random, 1);
    console.log(data);
    return data;
}

const removeRandomProperty = (data: any): any => {
//    delete data[
//        Object.keys(data)[
//            randomBetween(0, Object.keys(data).length -1)]];

    let dat = data[
        Object.keys(data)[
            randomBetween(0, Object.keys(data).length -1)]];

    return dat;
}


export default (body: any[] | any): any[] | any | undefined => {
    console.log("[headers] randomly removing properties and items...");
    if(Array.isArray(body))
        return removeRandomArray(body);
    else 
        return removeRandomProperty(body);
}