

import { activate, isSupported, fetchAndActivate, fetchConfig, getValue } from 'firebase/remote-config';
import { remoteConfig } from './firebase';

export let ocrFeatureFlag = false;