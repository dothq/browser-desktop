import { render } from "@testing-library/preact";
import React from "react";
import { Spring } from ".";

describe("UI Spring", () => {
    test("Render", () => {
        render(<Spring />);
    });
});
