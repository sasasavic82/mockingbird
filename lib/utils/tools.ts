import chalk from "chalk";

const log = console.log;

export type ProbabilityResponse = {
    random: number | undefined,
    passed: boolean
}

export const passed = (probabilityOfFailure: number | undefined): ProbabilityResponse => {

    if(probabilityOfFailure == undefined)
        probabilityOfFailure = 0;
    
    let random: number = Math.random();
    let hasPassed: boolean = random >= probabilityOfFailure

    log("probability: " + chalk.yellow(`${probabilityOfFailure}`) + `, ${hasPassed ? chalk.green.bold("passed") : chalk.red.bold("failed")}`)

    return {
        random: random,
        passed: hasPassed
    }
}

export const randomBetween = (min: number, max: number): number => {
    console.log(`generating random number between ${min} and ${max}`);
    return Math.floor(Math.random() * (max - min + 1) + min);
}