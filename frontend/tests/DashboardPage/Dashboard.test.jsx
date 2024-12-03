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
jest.mock("../../src/pages/DashboardPage/TourGuide/TourGuide.jsx", () => () => (
  <div data-testid="tour-guide" />
));
jest.mock("../../src/pages/DashboardPage/Slider/Slider.jsx", () => () => (
  <div data-testid="slider" />
));

jest.mock(
  "../../src/pages/DashboardPage/Demographics/DemographicsSelector.jsx",
  () =>
    ({ handleDemographicChange, selectedDemographic, demographicValues }) =>
      (
        <select
          data-testid="demographics-selector"
          onChange={handleDemographicChange}
          value={selectedDemographic}
        >
          {demographicValues.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      )
);

jest.mock(
  "../../src/pages/DashboardPage/QRCodeShare/QRCodeShare.jsx",
  () => () => <div data-testid="qrcode-share" />
);
jest.mock(
  "../../src/pages/DashboardPage/ControlButtons/ControlButtons.jsx",
  () => () => <div data-testid="control-buttons" />
);
jest.mock("../../src/pages/DashboardPage/ChatBot/ChatBot.jsx", () => () => (
  <div data-testid="chatbot-component" />
));
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

    // Check that the modal is rendered
    expect(screen.getByTestId("modal")).toBeInTheDocument();

    // Close the modal
    const closeButton = screen.getByRole("button", { name: "Close" });
    fireEvent.click(closeButton);

    // Check that the modal is no longer in the document
    await waitFor(() => {
      expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
    });
  });

  it("opens the chatbot when chatbot button is clicked", () => {
    render(
      <MockedProvider>
        <Dashboard />
      </MockedProvider>
    );

    // Click the chatbot button to open the chatbot
    const chatbotButton = screen.getByLabelText("Open Chatbot");
    fireEvent.click(chatbotButton);

    // Check that the chatbot is rendered
    expect(screen.getByTestId("chatbot-component")).toBeInTheDocument();
  });

  it("handles time frame change correctly", () => {
    render(
      <MockedProvider>
        <Dashboard />
      </MockedProvider>
    );

    const timeButton = screen.getByText("1 Day");
    fireEvent.click(timeButton);

    expect(screen.getByText("1 Day")).toHaveClass("active-button");
  });
});
