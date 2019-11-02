import { BaseSimulator } from "../baseSimulator"
import {
    SimulationConfig, SimulatorContext, SourceDescription, SourceTypes,
    SimulatorRequest, SimulatorResponse, NextSimulator, IncomingData, ExtendableSettings, SelectorHandler,
    StoreSettings, DataIndex, ResponseStatus
} from "../common/types"
import jsonata from "jsonata";

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

        if (!settings.source)
            return next();

        let selector: SelectorHandler<SourceDescription> = () => settings.source as SourceDescription;
        let context: SimulatorContext<SourceDescription> = this.contextualize(incomingData.body, selector, req, res, next);

        this.evaluate(context)
    }

    evaluate(context: SimulatorContext<SourceDescription>): void {

        if (context.settings.type == SourceTypes.Body)
            return context.next();

        if (context.settings.type == SourceTypes.Store)
            return this.fetchData(context);

        context.next();
    }

    fetchData(context: SimulatorContext<SourceDescription>): void {
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

    private evaluateQuery(settings: StoreSettings): any {
        let data: any = {
            [settings.storeKey]: this.dataStore[settings.storeKey]
        }
        let expression: jsonata.Expression = jsonata(settings.query as string);
        return expression.evaluate(data);
    }

}
