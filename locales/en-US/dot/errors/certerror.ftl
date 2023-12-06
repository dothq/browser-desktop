# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

certerror-page-title = Security error

# Titles

certerror-connection-not-secure-title = Connection is not secure
certerror-connection-secure-failure-title = Secure connection failed

# Common messages

certerror-go-back-action = Go back

certerror-insecure-connection-authenticity-preface = There is a problem with <strong>{ $host }</strong>’s authenticity.

certerror-insecure-connection-attackers-message = 
    If you decide to continue to the site, attackers may 
    be able to eavesdrop over or alter the connection.

# Actions

certerror-continue-button = Continue to site
certerror-continue-with-risk-button = Accept the risk and continue
certerror-view-certificate-button = View certificate

# Certificate expired

certerror-certificate-expired-explainer = 
    The website is either misconfigured or your 
    computer’s clock may be set to the wrong time.

certerror-certificate-expired-reason = 
    It is likely that this website uses an expired 
    certificate, which prevents Dot from sending 
    and receiving information securely.

certerror-certificate-expired-detailed-reason = 
    All security certificates are valid for a certain 
    period of time, where they expire after a certain 
    date or time. The certificate for <strong>{ $host }</strong> expired 
    on <strong>{ $expired_at }</strong>, therefore the connection between 
    you and the website cannot be encrypted.

certerror-certificate-expired-computer-clock-reason = 
    Your computer’s clock is set to <strong>{ DATETIME($date, weekday: "long", month: "long", year: "numeric", day: "numeric") }</strong>; if that 
    doesn’t appear to be correct, you should adjust your 
    clock to the correct date and refresh this page.

# Self-signed certificate

certerror-self-signed-explainer = 
    This website uses a self-signed certificate, 
    which is a potential security risk if you do 
    not trust the site.

# Outdated ciphers or protocols

certerror-outdated-methods-explainer =
    This website uses outdated or insecure encryption 
    techniques, meaning there is no guarantee that any 
    information sent or received from this website can 
    be secure.
