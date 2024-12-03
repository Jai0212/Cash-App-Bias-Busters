import React from "react";
import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import ControlButtons from "../../src/pages/DashboardPage/ControlButtons/ControlButtons";

jest.mock("../../src/envConfig", () => ({
  envConfig: () => "test",
}));

describe("ControlButtons Component", () => {
  let mockOnDownload;

  beforeEach(() => {
    mockOnDownload = jest.fn(); // Mock the onDownload prop
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks(); // Reset any mocked functions between tests
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

  it("shows the model import modal when import models button is clicked", () => {
    render(<ControlButtons onDownload={mockOnDownload} />);

    const importModelButton = screen.getByText(/import models/i);
    fireEvent.click(importModelButton);

    expect(screen.getByText(/model upload instructions/i)).toBeInTheDocument();
  });

  it("shows the dataset import modal when import dataset button is clicked", () => {
    render(<ControlButtons onDownload={mockOnDownload} />);

    const importDatasetButton = screen.getByText(/import dataset/i);
    fireEvent.click(importDatasetButton);

    expect(
      screen.getByText(/dataset upload instructions/i)
    ).toBeInTheDocument();
  });

  it("closes the model import modal when close button is clicked", async () => {
    render(<ControlButtons onDownload={mockOnDownload} />);

    fireEvent.click(screen.getByText(/import models/i));
    fireEvent.click(screen.getByLabelText(/close model upload instructions/i));

    await waitFor(() => {
      expect(
        screen.queryByText(/model upload instructions/i)
      ).not.toBeInTheDocument();
    });
  });

  it("closes the dataset import modal when close button is clicked", async () => {
    render(<ControlButtons onDownload={mockOnDownload} />);

    fireEvent.click(screen.getByText(/import dataset/i));
    fireEvent.click(
      screen.getByLabelText(/close dataset upload instructions/i)
    );

    await waitFor(() => {
      expect(
        screen.queryByText(/dataset upload instructions/i)
      ).not.toBeInTheDocument();
    });
  });

  it("handles model file upload correctly", async () => {
    const mockFile = new File(["dummy content"], "test.pkl", {
      type: "application/octet-stream",
    });
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => ({ message: "Success" }),
    });

    render(<ControlButtons onDownload={mockOnDownload} />);

    fireEvent.click(screen.getByText(/import models/i));
    fireEvent.click(screen.getByLabelText(/choose model file/i));

    const input = screen.getByLabelText(/import model file/i);
    Object.defineProperty(input, "files", {
      value: [mockFile],
    });

    fireEvent.change(input);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "test/api/upload-model",
        expect.any(Object)
      );
    });
  });

  it("handles dataset file upload correctly", async () => {
    const mockFile = new File(["dummy content"], "test.csv", {
      type: "text/csv",
    });
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => ({ message: "Success" }),
    });

    render(<ControlButtons onDownload={mockOnDownload} />);

    fireEvent.click(screen.getByText(/import dataset/i));
    fireEvent.click(screen.getByLabelText(/choose dataset file/i));

    const input = screen.getByLabelText(/import dataset file/i);
    Object.defineProperty(input, "files", {
      value: [mockFile],
    });

    fireEvent.change(input);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "test/api/upload-data",
        expect.any(Object)
      );
    });
  });

  it("fetches email and demographics on mount", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => ({ email: "test@example.com" }),
    });

    render(<ControlButtons onDownload={mockOnDownload} />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "test/get-email",
        expect.any(Object)
      );
    });
  });
});
