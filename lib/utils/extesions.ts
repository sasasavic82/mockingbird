import { IncomingData, ExtendableSettings, SimulatorResponse } from "../engine/common/types";

declare global {
    interface Number {
        thousandsSeperator(): String;
    }
    interface Response {
        badRequest(data?: any): Response | void
    }

    interface Object {
        parseRequestData(): IncomingData
    }

    interface String {
        chunkIt(chunks: number): RegExpExecArray
    }

    interface Object {
        chunkIt(chunks: number): string[]
    }

}

Number.prototype.thousandsSeperator = function (): string {
    return Number(this).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

Object.prototype.parseRequestData = function(this: any): IncomingData {
    return {
        body: this.body,
        settings: this.settings as ExtendableSettings<any>
    };   
}

Object.prototype.chunkIt = function(chunks: number): string[] {

    let stringifiedData = JSON.stringify(this);

    console.log(stringifiedData);

    if(stringifiedData === null || stringifiedData === undefined)
        return [];

    let chunkLength: number = Math.ceil(stringifiedData.length / chunks)

    let regex = '[\\s\\S]{1,' + chunkLength + '}';

    let parts = stringifiedData.match(new RegExp(regex, "g")) || [];

    return parts as [];
}

export { };