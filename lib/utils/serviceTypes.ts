export class IncomingRequest<T> {
    constructor(private _request: T) {
    }

    get request(): T {
        return this._request;
    }

    set request(newRequest: T) {
        this._request = newRequest
    }
}

export type KeyValue<K, V> = {
    key: K,
    value: V
}
