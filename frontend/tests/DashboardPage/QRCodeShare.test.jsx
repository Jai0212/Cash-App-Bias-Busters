import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import QRCodeShare from "../../src/pages/DashboardPage/QRCodeShare/QRCodeShare";
import { BrowserRouter } from "react-router-dom";

jest.mock("../../src/envConfig", () => ({
  envConfig: () => "https://cash-app-bias-busters.onrender.com",
}));

describe("QRCodeShare Component", () => {
  const selectedDemographic = "age";
  const selectedValues = [25, 30];
  const selectedSecondValues = [35, 40];
  const secondSelectedDemographic = "gender";
  const timeframe = "2022";
  const currUser = "testUser";

  it("renders share button", () => {
    render(
      <BrowserRouter>
        <QRCodeShare
          selectedDemographic={selectedDemographic}
          selectedValues={selectedValues}
          selectedSecondValues={selectedSecondValues}
          secondSelectedDemographic={secondSelectedDemographic}
          timeframe={timeframe}
          currUser={currUser}
        />
      </BrowserRouter>
    );

    const shareButton = screen.getByRole("button", { name: /share/i });
    expect(shareButton).toBeInTheDocument();
  });
});
