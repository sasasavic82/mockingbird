import { IncomingRequest } from "../../utils/serviceTypes"
import { Response, IncomingData, ProcessedResponse, Settings, MockingResult } from "./types";
import {  } from "uuid";
import uuid = require("uuid");

type SettingsItem = {
    key: string,
    settings: Settings
}
export class MockingEngine {
    
    protected settingsList: SettingsItem[];

    constructor() { 
        this.settingsList = [];
    }

    public ingest(incoming: IncomingRequest<IncomingData>): Promise<Response<ProcessedResponse>> {

        let data: ProcessedResponse = {
            headers: [{
                key: "x-auth",
                value: "abc123"
            }],
            body: "incoming.request.body"
        }

        let response: Response<ProcessedResponse> = {
            result: MockingResult.Success,
            response: data
        }

        return Promise.resolve(response);
    }

    public settings(settings: IncomingRequest<Settings>): Promise<SettingsItem> {
        let settingsItem: SettingsItem = {
            key: uuid.v4(),
            settings: settings.request
        };
        this.settingsList.push(settingsItem);

        return Promise.resolve(settingsItem)
    }

    public getSetting(key: string) : Promise<SettingsItem> | undefined {
        let item = this.settingsList.filter((item) => item.key == key);
        return Promise.resolve(item[0]);
    }
}