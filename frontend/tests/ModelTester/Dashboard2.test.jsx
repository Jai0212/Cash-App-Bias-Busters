import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Dashboard2 from "../../src/pages/ModelTester/Dashboard2/Dashboard2";
import axios from "axios";
import { Response } from "whatwg-fetch";
import swal from "sweetalert2";

jest.mock("axios");
jest.mock("sweetalert2", () => ({
  fire: jest.fn(),
}));

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ email: "test@example.com" }),
  })
);

describe("Dashboard2 Component", () => {
  beforeEach(() => {
    axios.post.mockResolvedValue({ data: [] });
    localStorage.setItem("uploadedFiles", JSON.stringify([]));
  });

  afterEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it("renders without crashing", async () => {
    render(<Dashboard2 />);

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
    render(<Dashboard2 />);

    // Click the upload button to open the modal
    const uploadButton = screen.getByText("Upload Models");
    fireEvent.click(uploadButton);

    // Check that the modal is rendered
    expect(screen.getByText("Model Upload Instructions")).toBeInTheDocument();
  });
});
