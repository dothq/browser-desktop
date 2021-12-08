import { render } from "@testing-library/preact";
import React from "react";
import { ToolbarButton } from ".";

describe("UI Spring", () => {
    test("Render", () => {
        render(<ToolbarButton />);
    });
});
