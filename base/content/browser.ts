import { DevToolsServer } from "resource://app/modules/DevToolsServer.jsm";
import { test } from "./test";

const devtools = DevToolsServer.get();
devtools.start();

document.addEventListener("DOMContentLoaded", () => {
    const el = document.getElementById("hello");

    if (el) {
        el.innerText = test();
    }
})