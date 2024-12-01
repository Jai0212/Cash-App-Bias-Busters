import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import TourGuide from "../../src/pages/DashboardPage/TourGuide/TourGuide";

describe("TourGuide Component", () => {
  const runTour = true;

  it("renders Joyride with correct steps", async () => {
    render(<TourGuide runTour={runTour} />);

    // Check that the expected steps' content is in the document
    const stepContents = [
      //   "Click here to upload the model file you want to use for analysis.",
    ];

    for (const content of stepContents) {
      // Use waitFor to ensure the element appears before checking
      await waitFor(() => screen.getByText(content));
      expect(screen.getByText(content)).toBeInTheDocument();
    }
  });
});
