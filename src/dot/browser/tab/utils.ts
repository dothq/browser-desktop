// import L10n from "../l10n";
// import { Services } from "../modules";

// export const TabUtils = new class {
//     public get emptyTabTitle() {
//         const isPrivate = dot.window.isPrivate();

//         // Normal browsing: default-tab-title
//         // Private browsing: default-private-tab-title
//         return L10n.ts(`default-${isPrivate ? "private" : ""}-tab-title`);
//     }

//     /*
//      * Get the linked tab from a browser element
//     */
//     public getTabFromBrowser(browser: HTMLBrowserElement) {
//         return dot.tabs.get(browser.browserId);
//     }

//     /*
//      * Handler for onpagetitlechange event
//     */
//     public onPageTitleChange(event: Event) {
//         const browser = event.target as HTMLBrowserElement;
//         const tab = this.getTabFromBrowser(browser);

//         // @todo: add check to return if tab is pending
//         if (
//             !tab ||
//             /*|| t.pending*/
//             (
//                 !browser.contentTitle &&
//                 browser.contentPrincipal.isSystemPrincipal
//             )
//         ) return;
  
//         let title = browser.contentTitle;
//         const isContentTitle = !!title;

//         // Check if we can use the page URL as the page title
//         if (browser.currentURI.displaySpec) {
//             try {
//                 title = Services.io.createExposableURI(browser.currentURI)
//                     .displaySpec;
//             } catch (e) {
//                 title = browser.currentURI.displaySpec;
//             }
//         }
  
//         if (title && !isBlankPageURL(title)) {
//             // Shorten the title is if it is a data: URI
//             if (title.length > 500 && title.match(/^data:[^,]+;base64,/)) {
//                 title = `${title.substring(0, 500)}\u2026`;
//             } else {
//                 try {
//                     const { characterSet } = browser;

//                     title = Services.textToSubURI.unEscapeNonAsciiURI(
//                         characterSet,
//                         title
//                     );
//                 } catch (e) {}
//             }
//         } else {
//             // Fallback to the default tab title
//             title = this.emptyTabTitle;
//         }

//         if (!isContentTitle) {
//             // Remove protocol and www subdomain
//             title = title.replace(/^[^:]+:\/\/(?:www\.)?/, "");
//         }

//         return title;
//     }
// }