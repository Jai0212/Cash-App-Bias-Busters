import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import ControlButtons from "../../src/pages/DashboardPage/ControlButtons/ControlButtons";

describe("ControlButtons Component", () => {
  let mockOnDownload;

  beforeEach(() => {
    mockOnDownload = jest.fn(); // Mock the onDownload prop
  });

  it("renders all buttons correctly", () => {
    render(<ControlButtons onDownload={mockOnDownload} />);
    expect(screen.getByText(/import models/i)).toBeInTheDocument();
    expect(screen.getByText(/import dataset/i)).toBeInTheDocument();
    expect(screen.getByText(/download graph/i)).toBeInTheDocument();
  });

  it("calls onDownload when the download button is clicked", () => {
    render(<ControlButtons onDownload={mockOnDownload} />);

    const downloadButton = screen.getByText(/download graph/i);
    fireEvent.click(downloadButton);

    expect(mockOnDownload).toHaveBeenCalled();
  });
});
