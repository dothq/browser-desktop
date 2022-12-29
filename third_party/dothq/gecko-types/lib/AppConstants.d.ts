/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

export interface AppConstants {
    NIGHTLY_BUILD: boolean;
    RELEASE_OR_BETA: boolean;
    EARLY_BETA_OR_EARLIER: boolean;
    IS_ESR: boolean;
    ACCESSIBILITY: boolean;
    MOZILLA_OFFICIAL: boolean;
    MOZ_OFFICIAL_BRANDING: boolean;
    MOZ_DEV_EDITION: boolean;
    MOZ_SERVICES_SYNC: boolean;
    MOZ_SERVICES_HEALTHREPORT: boolean;
    MOZ_DATA_REPORTING: boolean;
    MOZ_SANDBOX: boolean;
    MOZ_TELEMETRY_REPORTING: boolean;
    MOZ_TELEMETRY_ON_BY_DEFAULT: boolean;
    MOZ_UPDATER: boolean;
    MOZ_SWITCHBOARD: boolean;
    MOZ_WEBRTC: boolean;
    MOZ_WIDGET_GTK: boolean;
    XP_UNIX: boolean;
    platform: "linux" | "win" | "macosx" | "android" | "other";
    unixstyle: "linux" | "openbsd" | "netbsd" | "freebsd" | "solaris" | "other";
    isPlatformAndVersionAtLeast(
        platform: AppConstants["platform"],
        version: string
    ): boolean;
    isPlatformAndVersionAtMost(
        platform: AppConstants["platform"],
        version: string
    ): boolean;
    MOZ_CRASHREPORTER: boolean;
    MOZ_NORMANDY: boolean;
    MOZ_MAINTENANCE_SERVICE: boolean;
    MOZ_BACKGROUNDTASKS: boolean;
    MOZ_UPDATE_AGENT: boolean;
    MOZ_BITS_DOWNLOAD: boolean;
    DEBUG: boolean;
    ASAN: boolean;
    ASAN_REPORTER: boolean;
    TSAN: boolean;
    MOZ_SYSTEM_NSS: boolean;
    MOZ_PLACES: boolean;
    MOZ_REQUIRE_SIGNING: boolean;
    MOZ_UNSIGNED_SCOPES: number;
    MOZ_ALLOW_ADDON_SIDELOAD: boolean;
    MOZ_WEBEXT_WEBIDL_ENABLED: boolean;
    MENUBAR_CAN_AUTOHIDE: boolean;
    MOZ_ANDROID_HISTORY: boolean;
    MOZ_GECKO_PROFILER: boolean;
    DLL_PREFIX: string;
    DLL_SUFFIX: string;
    MOZ_APP_NAME: string;
    MOZ_APP_BASENAME: string;
    MOZ_APP_DISPLAYNAME_DO_NOT_USE: string;
    MOZ_APP_VERSION: string;
    MOZ_APP_VERSION_DISPLAY: string;
    MOZ_BUILD_APP: string;
    MOZ_MACBUNDLE_ID: string;
    MOZ_MACBUNDLE_NAME: string;
    MOZ_UPDATE_CHANNEL: string;
    MOZ_WIDGET_TOOLKIT: string;
    ANDROID_PACKAGE_NAME: string;
    DEBUG_JS_MODULES: string;
    MOZ_BING_API_CLIENTID: string;
    MOZ_BING_API_KEY: string;
    MOZ_GOOGLE_LOCATION_SERVICE_API_KEY: string;
    MOZ_GOOGLE_SAFEBROWSING_API_KEY: string;
    MOZ_MOZILLA_API_KEY: string;
    BROWSER_CHROME_URL: string;
    OMNIJAR_NAME: string;
    SOURCE_REVISION_URL: string;
    HAVE_USR_LIB64_DIR: boolean;
    HAVE_SHELL_SERVICE: boolean;
    MOZ_CODE_COVERAGE: boolean;
    TELEMETRY_PING_FORMAT_VERSION: string;
    MOZ_NEW_XULSTORE: boolean;
    MOZ_NEW_NOTIFICATION_STORE: boolean;
    ENABLE_WEBDRIVER: boolean;
    REMOTE_SETTINGS_SERVER_URL: string;
    REMOTE_SETTINGS_VERIFY_SIGNATURE: boolean;
    REMOTE_SETTINGS_DEFAULT_BUCKET: string;
    MOZ_GLEAN_ANDROID: boolean;
    MOZ_JXL: boolean;
    MOZ_CAN_FOLLOW_SYSTEM_TIME: boolean;
    MOZ_SYSTEM_POLICIES: boolean;

    // Returns true for CN region build when distibution id set as 'MozillaOnline'
    isChinaRepack(): boolean;
}