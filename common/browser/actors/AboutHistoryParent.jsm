/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

var EXPORTED_SYMBOLS = ["AboutHistoryParent"];
 
 class AboutHistoryParent extends JSWindowActorParent {
   async receiveMessage(message) {
     switch (message.name) {
       case "RequestHistory":
         return "test"
     }
 
     return undefined;
   }
 }
 