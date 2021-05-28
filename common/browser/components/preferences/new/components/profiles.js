/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

ChromeUtils.defineModuleGetter(
    this,
    "PromptUtils",
    "resource://gre/modules/SharedPromptUtils.jsm"
);

class ProfilesComponent {
    _service = null;

    DEFAULT_AVATARS = [...Array(10)].map((_, i) => `chrome://browser/content/preferences/new/avatars/${i + 1}.png`)

    stripName(name) {
        return name.replace(/-/g, " ").split(" ").map(w => {
            return w[0].toUpperCase() + w.substring(1);
        }).join(" ");
    }

    shouldMigrateName(profile) {
        // this will check if the current profile name is the same as the one in the profile dir
        return profile.rootDir.path.split(".").find(i => profile.name);
    }

    getProfileId(profile) {
        return profile.rootDir.path.split("/")[profile.rootDir.path.split("/").length - 1].split(".")[0];
    }

    profileIdToAvatar(id) {
        var seed = 10;

        var table = ["a", "b", "c", "d", "e", "f", "g", "h", "i",
            "j", "k", "l", "m", "n", "o", "p", "q", "r",
            "s", "t", "u", "v", "w", "x", "y", "z"];

        var avatarId = (parseInt(id.split("").map(a => {
            if (!isNaN(a)) return (Math.floor((a / seed) * table.length) - id.length)
            else return table.findIndex(b => b == a)
        }).join("")) % this.DEFAULT_AVATARS.length);

        return this.DEFAULT_AVATARS[avatarId];
    }

    async switchTo(id) {
        console.log(id)

        let profile = Array.from(this._service.profiles).find(p => p.name == id);

        if (profile) {
            let bag = PromptUtils.objectToPropBag({
                text: "test"
            });
            await windowRoot.ownerGlobal.gDialogBox.open(
                "chrome://browser/content/preferences/new/dialogs/switchProfile.html",
                {},
                bag
            );

            console.log(bag)

            this._service.defaultProfile = profile;
            this.render();

            // Services.startup.createInstanceWithProfile(profile);
        }
    }

    _template(data, selectedProfile) {
        data = Array.from(data);

        const secondaryProfilesTemplate = () => {
            return data.filter(p => p.rootDir.path !== selectedProfile.rootDir.path).map(profile => {
                return `<div id="${this.getProfileId(profile)}" class="preferences-item application-profile secondary">
                    <div class="application-profile-data">
                        <i class="application-profile-avatar"
                            style="--profile-avatar: url(${this.profileIdToAvatar(this.getProfileId(profile))})"></i>
                        <span class="application-profile-name">${this.shouldMigrateName(profile)
                        ? this.stripName(profile.name)
                        : profile.name
                    }</span>
                    </div>
                    <div class="application-profile-actions">
                        <a class="webui-button primary">Edit</a>
                        <a class="webui-button secondary" onclick="profiles.switchTo('${profile.name}')">Switch to…</a>
                    </div>
                </div>`;
            })
        }

        return `
            <div id="${this.getProfileId(selectedProfile)}" class="preferences-item application-profile primary">
                <div class="application-profile-data">
                    <i class="application-profile-avatar"
                        style="--profile-avatar: url(${this.profileIdToAvatar(this.getProfileId(selectedProfile))})"></i>
                    <span class="application-profile-name">${this.shouldMigrateName(selectedProfile)
                ? this.stripName(selectedProfile.name)
                : selectedProfile.name
            }</span>
                </div>
                <div class="application-profile-actions">
                    <a class="webui-button primary">Edit</a>
                </div>
            </div>
            <hr>
            <div style="display:flex;flex-direction:column;gap: 1.25rem">
                ${secondaryProfilesTemplate().join("")}
            </div>
        `
    }

    constructor() {
        this._service = Cc["@mozilla.org/toolkit/profile-service;1"].getService(
            Ci.nsIToolkitProfileService
        );

        console.log("[Profiles] Loaded profiles service.");
    }

    init() {
        this.render();
    }

    render() {
        const template = this._template(this._service.profiles, this._service.defaultProfile);

        let profilesEl = document.getElementById("profiles");
        profilesEl.innerHTML = template;
    }
}

const profiles = new ProfilesComponent();