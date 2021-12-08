import { render } from "@testing-library/preact";
import React from "react";
import { Chrome } from ".";

describe("UI Chrome", () => {
    test("Render", async () => {
        render(<Chrome />);
    });
});
