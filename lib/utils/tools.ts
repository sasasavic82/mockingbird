export const passed = (probabilityOfFailure: number | undefined): {
    random: number | undefined,
    passed: boolean
} => {

    if (probabilityOfFailure == undefined)
        probabilityOfFailure = 0;

    let random: number = Math.random();
    let hasPassed: boolean = random >= probabilityOfFailure

    return {
        random: random,
        passed: hasPassed
    }
}

export const randomBetween = (min: number, max: number): number => {
    //log(`generating random number between ${min} and ${max}`)
    return Math.floor(Math.random() * (max - min + 1) + min);
}

export const checkType = <T, K>(obj?: T, defaultValue: T = {} as T): T => {
    if (obj === undefined || obj === null)
        return defaultValue;
    return obj;
}

export const maybeWithDefault = <T>(obj?: T) =>
    <T>(defaultValue: T) => {
        if (obj === undefined || obj == null) return defaultValue;
        return obj;
    }

export const removeRandomArray = (data: Array<any>): Array<any> => {
    data.splice(randomBetween(0, data.length - 1), 1);
    return data;
}

export const removeRandomProperty = (data: any): any => {
    delete data[
        Object.keys(data)[
        randomBetween(0, Object.keys(data).length - 1)]];

    return data;
}