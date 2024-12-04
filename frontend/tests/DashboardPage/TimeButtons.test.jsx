import React from "react";
import { render, fireEvent } from "@testing-library/react";
import TimeButtons from "../../src/pages/DashboardPage/TimeButtons/TimeButtons";

describe("TimeButtons Component", () => {
  let mockHandleTimeframeChange;

  beforeEach(() => {
    mockHandleTimeframeChange = jest.fn(); // Mock the handleTimeframeChange function
  });

  it("renders all time buttons correctly", () => {
    const { getByText } = render(
      <TimeButtons
        handleTimeframeChange={mockHandleTimeframeChange}
        timeframe="day"
        lastTabIndex={0}
      />
    );
    expect(getByText(/1 day/i)).toBeInTheDocument();
    expect(getByText(/1 week/i)).toBeInTheDocument();
    expect(getByText(/1 month/i)).toBeInTheDocument();
    expect(getByText(/1 year/i)).toBeInTheDocument();
  });

  it("adds active class to the button corresponding to the current timeframe", () => {
    const { getByText } = render(
      <TimeButtons
        handleTimeframeChange={mockHandleTimeframeChange}
        timeframe="week"
        lastTabIndex={0}
      />
    );
    expect(getByText(/1 week/i)).toHaveClass("active-button");
  });

  it("calls handleTimeframeChange with 'day' when 1 Day button is clicked", () => {
    const { getByText } = render(
      <TimeButtons
        handleTimeframeChange={mockHandleTimeframeChange}
        timeframe="day"
        lastTabIndex={0}
      />
    );
    fireEvent.click(getByText(/1 day/i));
    expect(mockHandleTimeframeChange).toHaveBeenCalledWith("day");
  });

  it("calls handleTimeframeChange with 'week' when 1 Week button is clicked", () => {
    const { getByText } = render(
      <TimeButtons
        handleTimeframeChange={mockHandleTimeframeChange}
        timeframe="week"
        lastTabIndex={0}
      />
    );
    fireEvent.click(getByText(/1 week/i));
    expect(mockHandleTimeframeChange).toHaveBeenCalledWith("week");
  });

  it("calls handleTimeframeChange with 'month' when 1 Month button is clicked", () => {
    const { getByText } = render(
      <TimeButtons
        handleTimeframeChange={mockHandleTimeframeChange}
        timeframe="month"
        lastTabIndex={0}
      />
    );
    fireEvent.click(getByText(/1 month/i));
    expect(mockHandleTimeframeChange).toHaveBeenCalledWith("month");
  });

  it("calls handleTimeframeChange with 'year' when 1 Year button is clicked", () => {
    const { getByText } = render(
      <TimeButtons
        handleTimeframeChange={mockHandleTimeframeChange}
        timeframe="year"
        lastTabIndex={0}
      />
    );
    fireEvent.click(getByText(/1 year/i));
    expect(mockHandleTimeframeChange).toHaveBeenCalledWith("year");
  });

  it("sets correct tabIndex for each button", () => {
    const { getByText } = render(
      <TimeButtons
        handleTimeframeChange={mockHandleTimeframeChange}
        timeframe="day"
        lastTabIndex={0}
      />
    );
    expect(getByText(/1 day/i)).toHaveAttribute("tabIndex", "1");
    expect(getByText(/1 week/i)).toHaveAttribute("tabIndex", "2");
    expect(getByText(/1 month/i)).toHaveAttribute("tabIndex", "3");
    expect(getByText(/1 year/i)).toHaveAttribute("tabIndex", "4");
  });
});
