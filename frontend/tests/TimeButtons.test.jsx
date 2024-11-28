import React, { useState } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import TimeButtons from "../src/pages/DashboardPage/TimeButtons/TimeButtons";

// Helper component to manage state
const TestComponent = () => {
  const [timeframe, setTimeframe] = useState("day");

  return (
    <TimeButtons handleTimeframeChange={setTimeframe} timeframe={timeframe} />
  );
};

test("renders TimeButtons and verifies button functionality", () => {
  render(<TestComponent />);

  // Verify presence of buttons
  const dayButton = screen.getByText("1 Day");
  const weekButton = screen.getByText("1 Week");
  const monthButton = screen.getByText("1 Month");
  const yearButton = screen.getByText("1 Year");

  expect(dayButton).toBeInTheDocument();
  expect(weekButton).toBeInTheDocument();
  expect(monthButton).toBeInTheDocument();
  expect(yearButton).toBeInTheDocument();

  // Verify initial active button
  expect(dayButton).toHaveClass("active-button");

  // Simulate button clicks and verify function calls
  fireEvent.click(weekButton);
  expect(weekButton).toHaveClass("active-button");
  expect(dayButton).not.toHaveClass("active-button");

  fireEvent.click(monthButton);
  expect(monthButton).toHaveClass("active-button");
  expect(weekButton).not.toHaveClass("active-button");

  fireEvent.click(yearButton);
  expect(yearButton).toHaveClass("active-button");
  expect(monthButton).not.toHaveClass("active-button");
});
