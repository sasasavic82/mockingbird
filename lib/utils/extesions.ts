import { IncomingData, ExtendableSettings } from "../engine/common/types";

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


export { };