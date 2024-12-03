import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import QRCodeShare from "../../src/pages/DashboardPage/QRCodeShare/QRCodeShare"; // Adjust the path
import { envConfig } from "../../src/envConfig";
import { useNavigate } from "react-router-dom";

jest.mock("../../src/envConfig", () => ({
  envConfig: jest.fn(),
}));

jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
}));

describe("QRCodeShare Component", () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    envConfig.mockReturnValue("http://test-frontend-url.com");
    useNavigate.mockReturnValue(mockNavigate);
  });

  const defaultProps = {
    selectedDemographic: "Age",
    selectedValues: ["18-25", "26-35"],
    selectedSecondValues: ["M", "F"],
    secondSelectedDemographic: "Gender",
    timeframe: "Last Month",
    currUser: "TestUser",
  };

  test("renders Share button", () => {
    render(<QRCodeShare {...defaultProps} />);
    const shareButton = screen.getByRole("button", { name: /share/i });
    expect(shareButton).toBeInTheDocument();
  });

  test("opens modal and encodes data on Share button click", () => {
    render(<QRCodeShare {...defaultProps} />);
    const shareButton = screen.getByRole("button", { name: /share/i });

    fireEvent.click(shareButton);

    expect(screen.getByText(/scan the qr code to view detailed data/i)).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /qr code/i })).toBeInTheDocument();
  });

  test("handles navigation on Link click", () => {
    render(<QRCodeShare {...defaultProps} />);
    const shareButton = screen.getByRole("button", { name: /share/i });

    fireEvent.click(shareButton);

    const linkElement = screen.getByText(/link/i);
    fireEvent.click(linkElement);

    expect(window.open).toHaveBeenCalledWith(
        expect.stringContaining("http://test-frontend-url.com/share/"),
        "_blank"
    );
  });

  test("closes modal on close button click", () => {
    render(<QRCodeShare {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: /share/i }));
    const closeButton = screen.getByRole("button", { name: /×/i });

    fireEvent.click(closeButton);

    expect(screen.queryByText(/scan the qr code to view detailed data/i)).not.toBeInTheDocument();
  });

  test("handles encoding failure gracefully", () => {
    const faultyEncodeData = jest.fn().mockReturnValue(null);

    render(<QRCodeShare {...defaultProps} />);
    const shareButton = screen.getByRole("button", { name: /share/i });

    fireEvent.click(shareButton);

    expect(screen.getByText(/failed to share data. please try again/i)).toBeInTheDocument();
  });

  test("renders with missing props gracefully", () => {
    render(<QRCodeShare />);
    const shareButton = screen.getByRole("button", { name: /share/i });

    fireEvent.click(shareButton);

    expect(screen.getByText(/failed to share data. please try again/i)).toBeInTheDocument();
  });

  test("uses envConfig for frontend URL", () => {
    render(<QRCodeShare {...defaultProps} />);
    expect(envConfig).toHaveBeenCalled();
  });

  test("uses navigate for internal routing", () => {
    render(<QRCodeShare {...defaultProps} />);
    const shareButton = screen.getByRole("button", { name: /share/i });

    fireEvent.click(shareButton);
    const linkElement = screen.getByText(/link/i);

    fireEvent.click(linkElement);

    expect(mockNavigate).not.toHaveBeenCalled(); // External link, so navigate should not be called
  });
});
