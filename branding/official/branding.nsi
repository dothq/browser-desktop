# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

# NSIS branding defines for unofficial builds.
# The official release build branding.nsi is located in other-license/branding/firefox/
# The nightly build branding.nsi is located in browser/installer/windows/nsis/

# BrandFullNameInternal is used for some registry and file system values
# instead of BrandFullName and typically should not be modified.
!define BrandFullNameInternal "Dot Browser"
!define BrandFullName         "Dot Browser"
!define CompanyName           "Dot HQ"
!define URLInfoAbout          "https://www.dothq.org/${AB_CD}/"
!define URLUpdateInfo         "https://www.dothq.org/${AB_CD}/"
!define URLSystemRequirements "https://www.dothq.org/${AB_CD}/browser/system-requirements/"