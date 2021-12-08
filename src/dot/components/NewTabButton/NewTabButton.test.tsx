import { render } from "@testing-library/preact";
import React from "react";
import { NewTabButton } from ".";

describe("UI New Tab Button", () => {
    test("Render New Tab Button", async () => {
        render(<NewTabButton />);
    });
});
