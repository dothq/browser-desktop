# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

tab-identity-type-chrome = 
    .label = { -brand-short-name }
    .tooltip = This is a secure { -brand-shorter-name } page

tab-identity-type-extension = 
    .label = Extension - { $name }
    .tooltip = This page is loaded from the { $name } extension

tab-identity-type-local = 
    .label = File
    .tooltip = Local file on your computer

tab-identity-type-secure = 
    .label = Secure
    .tooltip = Verified by: { $caOrg }

tab-identity-type-unsecure = 
    .label = Not Secure
    .tooltip = Connection is not secure

tab-identity-type-error =
    .label = {$type ->
        [https_only] HTTPS-Only Mode
        [blocked] Blocked
       *[other] Error
    }
    .tooltip = An error prevented the page from loading