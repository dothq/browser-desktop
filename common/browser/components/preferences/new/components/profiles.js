/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

ChromeUtils.defineModuleGetter(
    this,
    "PromptUtils",
    "resource://gre/modules/SharedPromptUtils.jsm"
);

const mutateFunction = (f) => {
    return f.toString().replace(/^[^{]*{\s*/, '').replace(/\s*}[^}]*$/, '');
}

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

    switchTo(id) {
        let profile = Array.from(this._service.profiles).find(p => p.name == id);

        if (profile) {
            this._service.defaultProfile = profile;
            this.render();

            document.getElementById("application-profile-primary-edit").style.display = "none";
            document.getElementById("application-profile-primary-restart").style.display = "";
        }
    }

    _template(data, selectedProfile) {
        data = Array.from(data);

        return `
            <div id="${this.getProfileId(selectedProfile)}" class="preferences-item application-profile primary">
                <div class="application-profile-data">
                    <i class="application-profile-avatar"
                        style="--profile-avatar: url(${this.profileIdToAvatar(this.getProfileId(selectedProfile))})"></i>
                    <div style="display:flex;flex-direction:column;gap: 2px">
                        <span class="application-profile-name">${this.shouldMigrateName(selectedProfile)
                ? this.stripName(selectedProfile.name)
                : selectedProfile.name
            }</span>
                            <p style="margin:0;opacity:.5;font-size:13px;">Current profile</p>
                    </div>
                </div>
                <div class="application-profile-actions">
                    <a class="webui-button primary" id="application-profile-primary-edit">Edit</a>
                    <a class="webui-button primary warn" style="display: none" id="application-profile-primary-restart">Restart required</a>
                </div>
            </div>
            <hr>
            <div class="show-more-container" style="display:flex;flex-direction:column;" id="application-profile-show-more">
                <div class="preferences-item show-more-item" style="min-height: 28px">
                    Show more
                </div>

                <div class="show-more-data" style="display: none;flex-direction:column;gap: 1.25rem;margin-top: 16px;">
                    ${this._otherProfilesTemplate(data, selectedProfile)}
                </div>
            </div>
        `
    }

    _otherProfilesTemplate(data, selectedProfile) {
        data = Array.from(data);

        return (data.filter(p => p.rootDir.path !== selectedProfile.rootDir.path).map(profile => {
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
                    <a class="webui-button secondary switch-to-button" data-profile-id="${profile.name}">Switch to…</a>
                </div>
            </div>`;
        })).join("")
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

        let showMoreRevealerEl = document.getElementById("application-profile-show-more");
        let showMoreButtonEl = showMoreRevealerEl.childNodes[1];

        showMoreButtonEl.addEventListener("click", () => {
            let showMoreDataEl = showMoreRevealerEl.childNodes[3];

            if (!showMoreRevealerEl.getAttribute("open")) {
                showMoreRevealerEl.setAttribute("open", "true");
                showMoreDataEl.style.display = "flex";
                showMoreButtonEl.lastChild.textContent = `Show less`
            } else {
                showMoreRevealerEl.removeAttribute("open");
                showMoreDataEl.style.display = "none";
                showMoreButtonEl.lastChild.textContent = `Show more`
            }
        })

        profilesEl.querySelectorAll(".switch-to-button").forEach(el => {
            el.addEventListener("click", () => {
                this.switchTo(el.getAttribute("data-profile-id"));
            });
        })

        const profileAvatarEl = document.getElementById("profile-avatar");
        const profileNameEl = document.getElementById("profile-name");
        const profileExtraEl = document.getElementById("profile-extra");

        const avatarURL = this.profileIdToAvatar(this.getProfileId(this._service.defaultProfile));
        profileAvatarEl.style.backgroundImage = `url(${avatarURL})`;
        profileNameEl.textContent = this.shouldMigrateName(this._service.defaultProfile)
            ? this.stripName(this._service.defaultProfile.name)
            : this._service.defaultProfile.name;
        profileExtraEl.textContent = `Current profile`;
    }
}

const profiles = new ProfilesComponent();