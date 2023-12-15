/* -*- Mode: C++; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

#include "AboutRedirector.h"
#include "nsNetUtil.h"
#include "nsIChannel.h"
#include "nsIURI.h"
#include "nsIProtocolHandler.h"
#include "nsServiceManagerUtils.h"

namespace dot {
    namespace browser {
        NS_IMPL_ISUPPORTS(AboutRedirector, nsIAboutModule)

        struct RedirEntry {
            const char* id;
            const char* url;
            uint32_t flags;
        };

        /*
            Before modifying the next section ensure that you have added the
            page to the dot/components/about/components.conf file.

            Entries that do not have URI_SAFE_FOR_UNTRUSTED_CONTENT will have
            access to Chrome APIs. 

            Security policies such as CSP will need to be implemented on these
            pages to prevent unsafe code from being ran.
        */
        static const RedirEntry kRedirMap[] = {
            /* id, resourceURI, flags */
            {
                "blocked", 
                "chrome://dot/content/interstitials/tab-error.html",
                nsIAboutModule::URI_SAFE_FOR_UNTRUSTED_CONTENT |
                    nsIAboutModule::URI_CAN_LOAD_IN_CHILD | nsIAboutModule::ALLOW_SCRIPT |
                    nsIAboutModule::HIDE_FROM_ABOUTABOUT
            },
            {
                "certerror", 
                "chrome://dot/content/interstitials/tab-error.html",
                nsIAboutModule::URI_SAFE_FOR_UNTRUSTED_CONTENT |
                    nsIAboutModule::URI_CAN_LOAD_IN_CHILD | nsIAboutModule::ALLOW_SCRIPT |
                    nsIAboutModule::HIDE_FROM_ABOUTABOUT
            },
            {
                "framecrashed", 
                "chrome://dot/content/interstitials/frame-crashed.html",
                nsIAboutModule::URI_SAFE_FOR_UNTRUSTED_CONTENT |
                    nsIAboutModule::URI_CAN_LOAD_IN_CHILD |
                    nsIAboutModule::HIDE_FROM_ABOUTABOUT
            },
            {
                "home", 
                "chrome://dot/content/startpage/home.html", 
                nsIAboutModule::ALLOW_SCRIPT | nsIAboutModule::ENABLE_INDEXED_DB |
                    nsIAboutModule::URI_MUST_LOAD_IN_CHILD |
                    nsIAboutModule::URI_CAN_LOAD_IN_PRIVILEGEDABOUT_PROCESS |
                    nsIAboutModule::URI_SAFE_FOR_UNTRUSTED_CONTENT |
                    nsIAboutModule::ALLOW_UNSANITIZED_CONTENT
            },
            {
                "newtab", 
                "about:home", 
                nsIAboutModule::ALLOW_SCRIPT | nsIAboutModule::ENABLE_INDEXED_DB |
                    nsIAboutModule::URI_MUST_LOAD_IN_CHILD |
                    nsIAboutModule::URI_CAN_LOAD_IN_PRIVILEGEDABOUT_PROCESS |
                    nsIAboutModule::URI_SAFE_FOR_UNTRUSTED_CONTENT |
                    nsIAboutModule::ALLOW_UNSANITIZED_CONTENT
            },
            {
                "rights", 
                "chrome://global/content/aboutRights.xhtml", 
                nsIAboutModule::URI_SAFE_FOR_UNTRUSTED_CONTENT |
                    nsIAboutModule::ALLOW_SCRIPT | 
                    nsIAboutModule::IS_SECURE_CHROME_UI
            },
            {
                "settings", 
                "about:preferences", 
                nsIAboutModule::HIDE_FROM_ABOUTABOUT |
                    nsIAboutModule::ALLOW_SCRIPT | 
                    nsIAboutModule::IS_SECURE_CHROME_UI
            },
            {
                "tabcrashed", 
                "chrome://dot/content/interstitials/tab-crashed.html",
                nsIAboutModule::URI_SAFE_FOR_UNTRUSTED_CONTENT |
                    nsIAboutModule::ALLOW_SCRIPT | nsIAboutModule::HIDE_FROM_ABOUTABOUT
            },
            {
                "preferences", 
                "chrome://dot/content/settings/settings.html", 
                nsIAboutModule::HIDE_FROM_ABOUTABOUT |
                    nsIAboutModule::ALLOW_SCRIPT | 
                    nsIAboutModule::IS_SECURE_CHROME_UI
            },
            {
                "welcome", 
                "chrome://dot/content/onboarding/onboarding.html", 
                nsIAboutModule::ALLOW_SCRIPT | nsIAboutModule::ENABLE_INDEXED_DB |
                    nsIAboutModule::URI_MUST_LOAD_IN_CHILD |
                    nsIAboutModule::URI_CAN_LOAD_IN_PRIVILEGEDABOUT_PROCESS |
                    nsIAboutModule::URI_SAFE_FOR_UNTRUSTED_CONTENT |
                    nsIAboutModule::ALLOW_UNSANITIZED_CONTENT
            }
        };

        static nsAutoCString GetAboutModuleName(nsIURI* aURI) {
            nsAutoCString path;
            aURI->GetPathQueryRef(path);

            int32_t f = path.FindChar('#');
            if (f >= 0) path.SetLength(f);

            f = path.FindChar('?');
            if (f >= 0) path.SetLength(f);

            ToLowerCase(path);
            return path;
        }

        NS_IMETHODIMP
        AboutRedirector::NewChannel(
            nsIURI* aURI, 
            nsILoadInfo* aLoadInfo,
            nsIChannel** result
        ) {
            NS_ENSURE_ARG_POINTER(aURI);
            NS_ENSURE_ARG_POINTER(aLoadInfo);

            NS_ASSERTION(result, "must not be null");

            nsAutoCString path = GetAboutModuleName(aURI);

            nsresult rv;
            nsCOMPtr<nsIIOService> ioService = do_GetIOService(&rv);
            NS_ENSURE_SUCCESS(rv, rv);

            for (auto& redir : kRedirMap) {
                if (!strcmp(path.get(), redir.id)) {
                    nsAutoCString url;

                    // fall back to the specified url in the map
                    if (url.IsEmpty()) {
                        url.AssignASCII(redir.url);
                    }

                    nsCOMPtr<nsIChannel> tempChannel;
                    nsCOMPtr<nsIURI> tempURI;
                    rv = NS_NewURI(getter_AddRefs(tempURI), url);
                    NS_ENSURE_SUCCESS(rv, rv);

                    // If tempURI links to an external URI (i.e. something other than
                    // chrome:// or resource://) then set the result principal URI on the
                    // load info which forces the channel prncipal to reflect the displayed
                    // URL rather then being the systemPrincipal.
                    bool isUIResource = false;
                    rv = NS_URIChainHasFlags(
                        tempURI, 
                        nsIProtocolHandler::URI_IS_UI_RESOURCE,
                        &isUIResource
                    );
                    NS_ENSURE_SUCCESS(rv, rv);

                    rv = NS_NewChannelInternal(
                        getter_AddRefs(tempChannel), 
                        tempURI,
                        aLoadInfo
                    );
                    NS_ENSURE_SUCCESS(rv, rv);

                    if (!isUIResource) {
                        aLoadInfo->SetResultPrincipalURI(tempURI);
                    }
                    tempChannel->SetOriginalURI(aURI);

                    NS_ADDREF(*result = tempChannel);
                    return rv;
                }
            }

            return NS_ERROR_ILLEGAL_VALUE;
        }

        NS_IMETHODIMP
        AboutRedirector::GetURIFlags(nsIURI* aURI, uint32_t* result) {
            NS_ENSURE_ARG_POINTER(aURI);

            nsAutoCString name = GetAboutModuleName(aURI);

            for (auto& redir : kRedirMap) {
                if (name.Equals(redir.id)) {
                    *result = redir.flags;
                    return NS_OK;
                }
            }

            return NS_ERROR_ILLEGAL_VALUE;
        }

        NS_IMETHODIMP
        AboutRedirector::GetChromeURI(nsIURI* aURI, nsIURI** chromeURI) {
            NS_ENSURE_ARG_POINTER(aURI);

            nsAutoCString name = GetAboutModuleName(aURI);

            for (const auto& redir : kRedirMap) {
                if (name.Equals(redir.id)) {
                    return NS_NewURI(chromeURI, redir.url);
                }
            }

            return NS_ERROR_ILLEGAL_VALUE;
        }

        nsresult AboutRedirector::Create(REFNSIID aIID, void** result) {
            AboutRedirector* about = new AboutRedirector();
            if (about == nullptr) return NS_ERROR_OUT_OF_MEMORY;
            NS_ADDREF(about);
            nsresult rv = about->QueryInterface(aIID, result);
            NS_RELEASE(about);
            return rv;
        }
    }
}
