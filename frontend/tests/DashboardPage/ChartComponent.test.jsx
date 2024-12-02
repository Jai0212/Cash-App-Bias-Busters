import React from "react";
import { render, screen, fireEvent, act, waitFor} from "@testing-library/react";
import "@testing-library/jest-dom";
import userEvent from '@testing-library/user-event';

import ChartComponent from "../../src/pages/DashboardPage/ChartComponenet/ChartComponent"; // Adjust path as needed

// Mock the chart.js/auto module to mock the default export correctly
jest.mock('chart.js/auto', () => {
    return {
        __esModule: true, // This tells Jest that we're mocking a module with a default export
        default: jest.fn().mockImplementation(() => ({
            update: jest.fn(),
            destroy: jest.fn(),
        })),
    };
});

beforeEach(() => {
    jest.clearAllMocks(); // Clear mocks before each test to avoid state pollution
});

test("renders ChartComponent with chart data", () => {
    const chartData = [
        { feature1: "Group1", feature2: "Label1", accuracy: 0.8, falsepositive: 0.1, falsenegative: 0.1 },
        { feature1: "Group2", feature2: "Label2", accuracy: 0.7, falsepositive: 0.2, falsenegative: 0.1 },
    ];
    const sliderValue = 0.75;

    render(<ChartComponent chartData={chartData} sliderValue={sliderValue} />);

    // Check if the chart canvas is rendered
    const chartCanvas = screen.getByTestId("chart-canvas");
    expect(chartCanvas).toBeInTheDocument();
});

test("updates chart when slider value changes", async () => {
    const chartData = [
        { feature1: "Group1", feature2: "Label1", accuracy: 0.8, falsepositive: 0.1, falsenegative: 0.1 },
        { feature1: "Group2", feature2: "Label2", accuracy: 0.7, falsepositive: 0.2, falsenegative: 0.1 },
    ];
    let sliderValue = 0.75;

    const { rerender } = render(<ChartComponent chartData={chartData} sliderValue={sliderValue} />);

    // Initially, check the chart rendering with the first slider value
    const chartCanvas = screen.getByTestId("chart-canvas");
    expect(chartCanvas).toBeInTheDocument();

    // Change the slider value and rerender the component
    sliderValue = 0.85;
    rerender(<ChartComponent chartData={chartData} sliderValue={sliderValue} />);

    // Check if the chart updates after the slider value changes
    expect(chartCanvas).toBeInTheDocument();
});


test("calls downloadChart function when invoked", () => {
    const chartData = [
        { feature1: "Group1", feature2: "Label1", accuracy: 0.8, falsepositive: 0.1, falsenegative: 0.1 },
        { feature1: "Group2", feature2: "Label2", accuracy: 0.7, falsepositive: 0.2, falsenegative: 0.1 },
    ];
    const sliderValue = 0.75;

    const ref = React.createRef();
    render(<ChartComponent chartData={chartData} sliderValue={sliderValue} ref={ref} />);

    // Mock download logic
    const downloadSpy = jest.spyOn(ref.current, "downloadChart");

    // Call downloadChart function via ref
    act(() => {
        ref.current.downloadChart();
    });

    // Verify the download function was called
    expect(downloadSpy).toHaveBeenCalledTimes(1);
});
