

import { activate, isSupported, fetchAndActivate, fetchConfig, getValue } from 'firebase/remote-config';
import { remoteConfig } from './firebase';

export let ocrFeatureFlag = false;

export async function initRemoteConfig() {
    const rc = await remoteConfig();
    if (rc) {
        rc.settings.minimumFetchIntervalMillis = 0;
        rc.defaultConfig = {
            "ocr_feature_flag": false
        };

        // fetchConfig(); // values set on backend are fetched and cached
        // activate(); // make fetched values available to app
        await fetchAndActivate(rc);
        ocrFeatureFlag = getValue(rc, "ocr_feature_flag").asBoolean();
    }
}
initRemoteConfig();