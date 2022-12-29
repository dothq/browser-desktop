/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

import { SharedLibrary } from "../SharedLibrary";

export interface ServicesProfiler {
    StartProfiler: (
        entryCount: number,
        interval: number,
        features: string[],
        filters?: string[],
        activeTabId?: number,
        duration?: number
    ) => void;
    StopProfiler: () => void;
    IsPaused: () => boolean;
    Pause: () => void;
    Resume: () => void;
    IsSamplingPaused: () => boolean;
    PauseSampling: () => void;
    ResumeSampling: () => void;
    GetFeatures: () => string[];
    getProfileDataAsync: (sinceTime?: number) => Promise<object>;
    getProfileDataAsArrayBuffer: (sinceTime?: number) => Promise<ArrayBuffer>;
    getProfileDataAsGzippedArrayBuffer: (
        sinceTime?: number
    ) => Promise<ArrayBuffer>;
    IsActive: () => boolean;
    sharedLibraries: SharedLibrary[];
}