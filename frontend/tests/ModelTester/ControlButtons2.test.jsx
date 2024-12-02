import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ControlButton2 from "../../src/pages/ModelTester/ControlButtons2/ControlButtons2";
import axios from "axios";
import { Response } from "whatwg-fetch";

jest.mock("../../src/envConfig", () => ({
  envConfig: () => "test",
}));

jest.mock("axios");
jest.mock("sweetalert2", () => ({
  fire: jest.fn(),
}));

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ email: "test@example.com" }),
  })
);

describe("ControlButton2 Component", () => {
  beforeEach(() => {
    axios.get.mockResolvedValue({ data: { email: "test@example.com" } });
    localStorage.setItem("uploadedFiles", JSON.stringify([]));
  });

  afterEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it("renders without crashing", async () => {
    render(<ControlButton2 setUploadedFiles={() => {}} />);

    // Check that the upload button is rendered
    expect(screen.getByText("Upload Models")).toBeInTheDocument();

    // Verify email fetch call
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/get-email"),
        expect.any(Object)
      );
    });
  });

  it("opens modal when upload button is clicked", () => {
    render(<ControlButton2 setUploadedFiles={() => {}} />);

    // Click the upload button to open the modal
    const uploadButton = screen.getByText("Upload Models");
    fireEvent.click(uploadButton);

    // Check that the modal is rendered
    expect(screen.getByText("Model Upload Instructions")).toBeInTheDocument();
  });

  it("closes modal when close button is clicked", async () => {
    render(<ControlButton2 setUploadedFiles={() => {}} />);

    // Click the upload button to open the modal
    const uploadButton = screen.getByText("Upload Models");
    fireEvent.click(uploadButton);

    // Close the modal
    const closeButton = screen.getByRole("button", { name: "×" });
    fireEvent.click(closeButton);

    // Check that the modal is no longer in the document
    await waitFor(() => {
      expect(
        screen.queryByText("Model Upload Instructions")
      ).not.toBeInTheDocument();
    });
  });

  it("uploads a file", async () => {
    axios.post.mockResolvedValue({ data: { message: "Success" } });

    render(<ControlButton2 setUploadedFiles={() => {}} />);

    // Mock the file input and file upload process
    const file = new File(["file content"], "test.pkl", {
      type: "application/octet-stream",
    });

    // Click the upload button to open the modal
    const uploadButton = screen.getByText("Upload Models");
    fireEvent.click(uploadButton);

    // Simulate file upload
    const input = screen.getByTestId("file-input");
    fireEvent.change(input, { target: { files: [file] } });

    // // Wait for the axios post request to be called
    // await waitFor(() => {
    //   expect(axios.post).toHaveBeenCalledWith(
    //     expect.stringContaining(""),
    //     expect.any(FormData)
    //   );
    // });
  });

  it("deletes a file", async () => {
    render(<ControlButton2 setUploadedFiles={() => {}} />);

    // Simulate adding a file to local storage
    localStorage.setItem("uploadedFiles", JSON.stringify(["test.pkl"]));

    // Re-render the component to load the file from local storage
    render(<ControlButton2 setUploadedFiles={() => {}} />);

    // Check that the file is rendered
    expect(screen.getByText("test.pkl")).toBeInTheDocument();

    // Click the delete button to remove the file
    const deleteButton = screen.getByRole("button", { name: "❌" });
    fireEvent.click(deleteButton);

    // Check that the file is deleted from local storage
    await waitFor(() => {
      expect(localStorage.getItem("uploadedFiles")).toBe(JSON.stringify([]));
    });

    // Check that the file is removed from the document
    expect(screen.queryByText("test.pkl")).not.toBeInTheDocument();
  });
});
