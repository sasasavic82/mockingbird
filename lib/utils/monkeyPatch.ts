import contentType from "content-type";

export interface BodyFunction {
    (this: any, body: any): any
}

export const setCharset = (type: any, charset: any): any => {
    if (!type || !charset) {
        return type;
    }

    // parse type
    var parsed = contentType.parse(type);

    // set charset
    parsed.parameters.charset = charset;

    return contentType.format(parsed);
}

export interface OverrideSendConfig {
    contentLength?: number,
    overrideCharset?: string
}

export const overrideSend = (config: OverrideSendConfig): BodyFunction => {

    let send: BodyFunction = function (this: any, body: any) {
        var chunk = body;
        var encoding: any;
        var req = this.req;
        var type;

        // settings
        var app = this.app;

        switch (typeof chunk) {
            // string defaulting to html
            case 'string':
                if (!this.get('Content-Type')) {
                    this.type('html');
                }
                break;
            case 'boolean':
            case 'number':
            case 'object':
                if (chunk === null) {
                    chunk = '';
                } else if (Buffer.isBuffer(chunk)) {
                    if (!this.get('Content-Type')) {
                        this.type('bin');
                    }
                } else {
                    return this.json(chunk);
                }
                break;
        }

        // write strings in utf-8
        if (typeof chunk === 'string') {

            encoding = 'utf8';
            type = this.get('Content-Type');
            // reflect this in content-type

            if (typeof type === 'string') {
                this.set('Content-Type', setCharset(type, config.overrideCharset ? config.overrideCharset : 'utf-8'));
            }
        }

        // determine if ETag should be generated
        var etagFn = app.get('etag fn')
        var generateETag = !this.get('ETag') && typeof etagFn === 'function'

        // populate Content-Length


        var len
        if (chunk !== undefined) {
            if (Buffer.isBuffer(chunk)) {
                // get length of Buffer
                len = chunk.length
            } else if (!generateETag && chunk.length < 1000) {
                // just calculate length when no ETag + small chunk
                len = Buffer.byteLength(chunk, encoding)
            } else {
                // convert chunk to Buffer and calculate
                chunk = Buffer.from(chunk, encoding)
                encoding = undefined;
                len = chunk.length
            }
            
            this.set('Content-Length', config.contentLength ? config.contentLength : len);
        }

        // populate ETag
        var etag;
        if (generateETag && len !== undefined) {
            if ((etag = etagFn(chunk, encoding))) {
                this.set('ETag', etag);
            }
        }

        // freshness
        if (req.fresh) this.statusCode = 304;

        // strip irrelevant headers
        if (204 === this.statusCode || 304 === this.statusCode) {
            this.removeHeader('Content-Type');
            this.removeHeader('Content-Length');
            this.removeHeader('Transfer-Encoding');
            chunk = '';
        }

        if (req.method === 'HEAD') {
            // skip body for HEAD
            this.end();
        } else {
            // respond
            this.end(chunk, encoding);
        }

        return this;
    };

    return send;
}