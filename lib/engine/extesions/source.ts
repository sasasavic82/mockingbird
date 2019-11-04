import { BaseSimulator } from "../baseSimulator"
import {
    SimulationConfig, SimulatorContext, SourceDescription, SourceTypes,
    SimulatorRequest, SimulatorResponse, NextSimulator, IncomingData, ExtendableSettings, SelectorHandler,
    StoreSettings, DataIndex, ResponseStatus, ProxySettings
} from "../common/types"
import jsonata from "jsonata";
import request from 'request-promise-native';


export class SourceLayer extends BaseSimulator<SourceDescription> {

    private dataStore: DataIndex<Object>;

    constructor(data: DataIndex<Object> | {}) {
        let config: SimulationConfig = {
            namespace: "source-layer"
        }
        super(config);

        this.dataStore = data;
    }

    ingest(req: SimulatorRequest, res: SimulatorResponse, next: NextSimulator): any {

        let incomingData: IncomingData = res.locals as IncomingData;
        let settings: ExtendableSettings<SourceDescription> = super.castSettings((incomingData).settings);

        if (!settings || !settings.source)
            return next();

        let selector: SelectorHandler<SourceDescription> = () => settings.source as SourceDescription;
        let context: SimulatorContext<SourceDescription> = this.contextualize(incomingData.body, selector, req, res, next);

        if (context.settings.type == SourceTypes.Body && !context.body) {
            context.res
                .status(ResponseStatus.BAD_REQUEST)
                .send({ error: `source type of ${context.settings.type} supplied, but body parameter is empty` });
            return;
        }

        this.evaluate(context)
    }

    async evaluate(context: SimulatorContext<SourceDescription>): Promise<any> {

        if(context.settings.type == SourceTypes.Body)
            return context.next();

        if (context.settings.type == SourceTypes.Store)
            return this.fetchStoreData(context);

        if(context.settings.type == SourceTypes.Http)
            return this.fetchHttpData(context);

        context.next();
    }

    fetchStoreData(context: SimulatorContext<SourceDescription>): void {
        let storeSettings: StoreSettings = context.settings.settings as StoreSettings;

        if (!storeSettings)
            return;

        if (!this.dataStore.hasOwnProperty(storeSettings.storeKey)) {
            context.res
                .status(ResponseStatus.NOT_FOUND)
                .send({ error: `${storeSettings.storeKey} store key not found` });

            return;
        }

        try {
            context.res.locals.body =
                storeSettings.query ? this.evaluateQuery(storeSettings) : this.dataStore[storeSettings.storeKey]

        } catch(e) {
            context.res
                .status(ResponseStatus.BAD_REQUEST)
                .send({ error: `Unable to evaluate query '${storeSettings.query}'` });
            return;
        }

        return context.next();


    }

    async fetchHttpData(context: SimulatorContext<SourceDescription>): Promise<any> {
        
        let proxySettings: ProxySettings = context.settings.settings as ProxySettings;

        // Force JSON
        proxySettings["json"] = true;

        if (!proxySettings)
            return;

        try {
            context.res.locals.body = await request(proxySettings);

        } catch(e) {
            context.res
                .status(ResponseStatus.BAD_REQUEST)
                .send({ error: `Unable to reach '${proxySettings.uri}'` });
            return;
        }

        return context.next();

    }

    private evaluateQuery(settings: StoreSettings): any {
        let data: any = {
            [settings.storeKey]: this.dataStore[settings.storeKey]
        }
        let expression: jsonata.Expression = jsonata(settings.query as string);
        return expression.evaluate(data);
    }

}
