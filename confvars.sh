#! /bin/sh
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

MOZ_APP_NAME=dot

if test "$OS_ARCH" = "WINNT"; then
  if ! test "$HAVE_64BIT_BUILD"; then
    MOZ_VERIFY_MAR_SIGNATURE=1
  fi
fi

MOZ_BRANDING_DIRECTORY=dot/branding/official
MOZ_OFFICIAL_BRANDING_DIRECTORY=dot/branding/official

MOZ_APP_ID={818c990f-687c-498c-bc9a-a99d9729702a}

MOZ_DEVTOOLS=all
