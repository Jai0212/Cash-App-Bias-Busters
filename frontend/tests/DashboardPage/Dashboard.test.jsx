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
  <div data-testid="modal">
    <button onClick={closeModal}>Close</button>
  </div>
));

describe("Dashboard Component", () => {
  beforeEach(() => {
    axios.post.mockResolvedValue({ data: {} });
    axios.get.mockResolvedValue({ data: { email: "test@example.com" } });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders without crashing", () => {
    render(
      <MockedProvider>
        <Dashboard />
      </MockedProvider>
    );

    // Check that all major components are rendered
    expect(screen.getByTestId("tour-guide")).toBeInTheDocument();
    expect(screen.getByTestId("slider")).toBeInTheDocument();
    expect(screen.getByTestId("demographics-selector")).toBeInTheDocument();
    expect(screen.getByTestId("qrcode-share")).toBeInTheDocument();
    expect(screen.getByTestId("control-buttons")).toBeInTheDocument();
  });

  it("opens the modal when info button is clicked", async () => {
    render(
      <MockedProvider>
        <Dashboard />
      </MockedProvider>
    );

    // Click the info button to open the modal
    const infoButton = screen.getByRole("button", { name: "?" });
    fireEvent.click(infoButton);

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
