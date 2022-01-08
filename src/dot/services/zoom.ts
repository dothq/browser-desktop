// import { dot } from "../api";
// import { exportPublic } from "../shared/globals";

// class ZoomManager {
//     public get min() {
//         return dot.prefs.get("zoom.minPercent") / 100;
//     }

//     public get max() {
//         return dot.prefs.get("zoom.maxPercent") / 100;
//     }

//     get useNormalZoom() {
//         // true => use normal zoom
//         // false => use text zoom
//         return dot.prefs.get("browser.zoom.full");
//     }

//     set useNormalZoom(value: boolean) {
//         dot.prefs.set("browser.zoom.full", value);
//     }

//     get currentZoom() {
//         return this.getZoomOfTab(
//             dot.browsersPrivate.selectedId
//         );
//     }

//     set currentZoom(zoom: number) {
//         this.setZoomForTab(
//             dot.browsersPrivate.selectedId,
//             zoom
//         );
//     }

//     public usesNormalZoom(id: number) {
//         const tab = dot.tabs.get(id);

//         if (tab) {
//             return (
//                 this.useNormalZoom ||
//                 tab.webContents.isSyntheticDocument
//             );
//         } else {
//             return false;
//         }
//     }

//     public getZoomOfTab(id: number) {
//         const tab = dot.tabs.get(id);

//         if (tab) {
//             const zoom = this.usesNormalZoom(id)
//                 ? tab.webContents.fullZoom
//                 : tab.webContents.textZoom;

//             // Round to remove any floating-point error.
//             return Number(zoom ? zoom.toFixed(2) : 1);
//         } else {
//             return 1;
//         }
//     }

//     public setZoomForTab(id: number, zoom: number) {
//         const tab = dot.tabs.get(id);

//         if (!tab) {
//             return console.error(
//                 `Unknown tab with id ${id}.`
//             );
//         }

//         if (zoom < this.min || zoom > this.max) {
//             return console.error(
//                 `Zoom level must be between ${this.min} and ${this.max}.`
//             );
//         }

//         const usesNormalZoom = this.usesNormalZoom(id);

//         tab.webContents.textZoom = usesNormalZoom
//             ? 1
//             : zoom;
//         tab.webContents.fullZoom = !usesNormalZoom
//             ? 1
//             : zoom;
//     }

//     get zoomValues() {
//         const values = dot.prefs
//             .get("toolkit.zoomManager.zoomValues")
//             .split(",")
//             .map(parseFloat);

//         values.sort((a: number, b: number) => a - b);

//         while (values[0] < this.min) {
//             values.shift();
//         }

//         while (values[values.length - 1] > this.max) {
//             values.pop();
//         }

//         return values;
//     }

//     public enlarge() {
//         var i =
//             this.zoomValues.indexOf(
//                 this.snap(this.currentZoom)
//             ) + 1;
//         if (i < this.zoomValues.length) {
//             this.currentZoom = this.zoomValues[i];
//         }
//     }

//     public reduce() {
//         var i =
//             this.zoomValues.indexOf(
//                 this.snap(this.currentZoom)
//             ) - 1;
//         if (i >= 0) {
//             this.currentZoom = this.zoomValues[i];
//         }
//     }

//     public reset() {
//         this.currentZoom = 1;
//     }

//     public toggleZoom() {
//         const currentZoom = this.currentZoom;

//         this.useNormalZoom = !this.useNormalZoom;
//         this.currentZoom = currentZoom;
//     }

//     public snap(zoom: number) {
//         var values = this.zoomValues;
//         for (var i = 0; i < values.length; i++) {
//             if (values[i] >= zoom) {
//                 if (
//                     i > 0 &&
//                     zoom - values[i - 1] <
//                         values[i] - zoom
//                 ) {
//                     i--;
//                 }
//                 return values[i];
//             }
//         }
//         return values[i - 1];
//     }
// }

// export const zoomManager = new ZoomManager();
// exportPublic("ZoomManager", zoomManager);
