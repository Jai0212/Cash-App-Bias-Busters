import React from "react";
import { render, screen } from "@testing-library/react";
import ChartComponent2 from "../../src/pages/ModelTester/ChartComponenet2/ChartComponent2";
import { Chart } from "chart.js/auto";

// Mock Chart.js
jest.mock("chart.js/auto", () => {
  const ChartMock = jest.fn().mockImplementation(() => ({
    destroy: jest.fn(),
    update: jest.fn(),
    toDataURL: jest.fn().mockReturnValue("data:image/png;base64,chart-data"),
  }));
  return {
    Chart: ChartMock,
  };
});

describe("ChartComponent2", () => {
  const mockChartData = {
    labels: ["Model 1", "Model 2"],
    datasets: [
      {
        label: "Dataset 1",
        data: [0.2, 0.8],
      },
    ],
  };

  const mockGenerationalResults = [
    { race: "A", gender: "M", age_groups: "20-30", state: "CA", variance: 0.1 },
    { race: "B", gender: "F", age_groups: "30-40", state: "NY", variance: 0.2 },
  ];

  it("renders the canvas element", () => {
    render(
      <ChartComponent2
        chartData={mockChartData}
        generationalResults={mockGenerationalResults}
      />
    );

    const canvas = screen.getByTestId("chart-canvas");
    expect(canvas).toBeInTheDocument();
  });

  it("initializes the chart with correct data", () => {
    render(
      <ChartComponent2
        chartData={mockChartData}
        generationalResults={mockGenerationalResults}
      />
    );

    expect(Chart).toHaveBeenCalledTimes(2);
    expect(Chart.mock.calls[0][1].data).toMatchObject(mockChartData);
  });

  it("calls downloadChart method", () => {
    const ref = React.createRef();

    render(
      <ChartComponent2
        ref={ref}
        chartData={mockChartData}
        generationalResults={mockGenerationalResults}
      />
    );

    const mockLink = {
      href: "",
      download: "",
      click: jest.fn(),
    };
    document.createElement = jest.fn().mockReturnValue(mockLink);

    ref.current.downloadChart();

    expect(document.createElement).toHaveBeenCalledWith("a");
    expect(mockLink.href).toBe(null);
    expect(mockLink.download).toBe("chart.png");
    expect(mockLink.click).toHaveBeenCalled();
  });
});
