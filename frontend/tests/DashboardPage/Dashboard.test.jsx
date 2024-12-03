import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing"; // Use if Apollo Client is used
import Dashboard from "../../src/pages/DashboardPage/Dashboard/Dashboard";
import { act } from "react-dom/test-utils";
import axios from "axios";

jest.mock("../../src/envConfig", () => ({
  envConfig: () => "test",
}));

// Mock dependencies
jest.mock("axios");
jest.mock("sweetalert2", () => ({
  fire: jest.fn(),
}));
jest.mock("../../src/pages/DashboardPage/TourGuide/TourGuide.jsx", () => () => <div />);
jest.mock("../../src/pages/DashboardPage/Slider/Slider.jsx", () => () => <div />);
jest.mock("../../src/pages/DashboardPage/Demographics/DemographicsSelector.jsx", () => () => <div />);
jest.mock("../../src/pages/DashboardPage/QRCodeShare/QRCodeShare.jsx", () => () => <div />);
jest.mock("../../src/pages/DashboardPage/ControlButtons/ControlButtons.jsx", () => () => <div />);
jest.mock("../../src/pages/DashboardPage/ChatBot/ChatBot.jsx", () => () => <div />);
jest.mock("../../src/Components/Modal/Modal.jsx", () => ({ closeModal }) => (
    <div>
      <button onClick={closeModal}>Close</button>
    </div>
));

jest.mock("axios", () => ({
  post: jest.fn(),
  get: jest.fn(),
}));

describe("Dashboard Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders Dashboard component", async () => {
    axios.get.mockResolvedValueOnce({ data: { email: "test@user.com" } });
    axios.post.mockResolvedValueOnce({
      data: {
        demographics: ["age", "gender"],
        choices: { age: ["18-25", "26-35"], gender: ["Male", "Female"] },
        time: "year",
      },
    });

    render(<Dashboard />);

    expect(screen.getByText("Close")).toBeInTheDocument();
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));
  });

  test("handles user email not found", async () => {
    axios.get.mockResolvedValueOnce({ data: {} });
    axios.post.mockResolvedValueOnce({
      data: {
        demographics: ["age", "gender"],
        choices: { age: ["18-25", "26-35"], gender: ["Male", "Female"] },
        time: "year",
      },
    });

    render(<Dashboard />);

    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));
    expect(screen.getByText("Close")).toBeInTheDocument();
  });

  test("opens and closes modal", async () => {
    render(<Dashboard />);
    const modalButton = screen.getByText("?");

    fireEvent.click(modalButton);
    expect(screen.getByText("Close")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Close"));
    expect(screen.queryByText("Close")).not.toBeInTheDocument();
  });

  test("changes time frame and triggers new data request", async () => {
    axios.get.mockResolvedValueOnce({ data: { email: "test@user.com" } });
    axios.post.mockResolvedValueOnce({
      data: {
        demographics: ["age", "gender"],
        choices: { age: ["18-25", "26-35"], gender: ["Male", "Female"] },
        time: "year",
      },
    });

    render(<Dashboard />);

    // Simulate time frame change
    const timeButton = screen.getByText("year"); // Assuming it's showing 'year' by default
    fireEvent.click(timeButton);

    // Assuming the text changes to a different time period like 'month'
    await waitFor(() => expect(screen.getByText("month")).toBeInTheDocument());
    expect(axios.post).toHaveBeenCalledTimes(2);  // Ensure that API is called after time change
  });

  test("fetches data correctly on load", async () => {
    axios.get.mockResolvedValueOnce({ data: { email: "test@user.com" } });
    axios.post.mockResolvedValueOnce({
      data: {
        demographics: ["age", "gender"],
        choices: { age: ["18-25", "26-35"], gender: ["Male", "Female"] },
        time: "year",
      },
    });

    render(<Dashboard />);
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));
    expect(axios.post).toHaveBeenCalledTimes(1);
  });

  test("handles error fetching demographics", async () => {
    axios.get.mockResolvedValueOnce({ data: { email: "test@user.com" } });
    axios.post.mockRejectedValueOnce(new Error("Error fetching demographics"));

    render(<Dashboard />);
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));
    expect(axios.post).toHaveBeenCalledTimes(1);
  });

  test("calls generate function when data is valid", async () => {
    axios.get.mockResolvedValueOnce({ data: { email: "test@user.com" } });
    axios.post.mockResolvedValueOnce({
      data: {
        demographics: ["age", "gender"],
        choices: { age: ["18-25", "26-35"], gender: ["Male", "Female"] },
        time: "year",
      },
    });

    render(<Dashboard />);

    // Simulate clicking 'Generate' button
    const generateButton = screen.getByText("Generate");
    fireEvent.click(generateButton);

    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
  });

  // Test for missing lines (specific state update, handling response, etc.)
  test("handles state updates correctly for user email", async () => {
    axios.get.mockResolvedValueOnce({ data: { email: "test@user.com" } });
    axios.post.mockResolvedValueOnce({
      data: {
        demographics: ["age", "gender"],
        choices: { age: ["18-25", "26-35"], gender: ["Male", "Female"] },
        time: "year",
      },
    });

    render(<Dashboard />);
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

    // Check for state-dependent content here
    // For example, check if demographics are being displayed after fetch
    expect(screen.getByText("age")).toBeInTheDocument();
    expect(screen.getByText("gender")).toBeInTheDocument();
  });

  test("handles time frame change and re-renders appropriately", async () => {
    axios.get.mockResolvedValueOnce({ data: { email: "test@user.com" } });
    axios.post.mockResolvedValueOnce({
      data: {
        demographics: ["age", "gender"],
        choices: { age: ["18-25", "26-35"], gender: ["Male", "Female"] },
        time: "month",
      },
    });

    render(<Dashboard />);
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

    // Simulate timeframe change (assuming it’s a dropdown or button)
    const timeButton = screen.getByText("year");
    fireEvent.click(timeButton);
    expect(screen.getByText("month")).toBeInTheDocument();

    // Ensure new API request happens on time change
    expect(axios.post).toHaveBeenCalledTimes(2);
  });
});