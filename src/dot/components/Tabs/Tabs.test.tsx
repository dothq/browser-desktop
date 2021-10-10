import { render, screen } from "@testing-library/react";
import React from "react";
import { Tabs } from ".";

describe("UI Tab", () => {
    test("Render", async () => {
        render(<Tabs></Tabs>);

        expect(
            await screen.findByText(/Inner text/)
        ).toBeInTheDocument();
    });
});
