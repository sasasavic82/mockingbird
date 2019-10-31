export abstract class BaseMockingbirdError extends  Error {
    readonly name!: string;

    constructor(message: object | string) {
        if(message instanceof Object) {
            super(JSON.stringify(message));
        } else {
            super(message);
        }
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class SimulatorExistsError extends BaseMockingbirdError {
    constructor(message: string | object = "Bad Request") {
        super(message);
    }
}