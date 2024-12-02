import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Slider from "../../src/pages/DashboardPage/Slider/Slider";

// Mock the ChartComponent
jest.mock(
  "../../src/pages/DashboardPage/ChartComponenet/ChartComponent",
  () => (props) => <div data-testid="chart-component" />
);

describe("Slider Component", () => {
  const graphData = { data: [1, 2, 3] }; // Mock data that fits your ChartComponent's expected input
  const maxValue = jest.fn(() => 100);

  it("renders slider component", () => {
    render(<Slider graphData={graphData} maxValue={maxValue} />);

    const sliderLabel = screen.getByText(/bias threshold/i);
    expect(sliderLabel).toBeInTheDocument();
  });

  it("changes slider value and updates style", () => {
    render(<Slider graphData={graphData} maxValue={maxValue} />);

    const slider = screen.getByRole("slider");
    fireEvent.change(slider, { target: { value: 0.7 } });

    expect(slider.value).toBe("0.7");
  });
});
