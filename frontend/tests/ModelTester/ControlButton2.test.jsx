import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import ControlButtons2 from "../../src/pages/ModelTester/ControlButtons2/ControlButton2";


// Mock `window.alert`
global.alert = jest.fn();

// Mock `localStorage`
const localStorageMock = (() => {
    let store = {};
    return {
        getItem: jest.fn((key) => store[key] || null),
        setItem: jest.fn((key, value) => {
            store[key] = value;
        }),
        removeItem: jest.fn((key) => {
            delete store[key];
        }),
        clear: jest.fn(() => {
            store = {};
        }),
    };
})();
Object.defineProperty(window, "localStorage", { value: localStorageMock });

// Mock `fetch`
global.fetch = jest.fn();

describe("ControlButton2 Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorageMock.clear();
    });

    test("fetchEmailAndDemographics handles successful email fetch", async () => {
        const mockEmail = { email: "test@example.com" };
        fetch.mockResolvedValueOnce({
            ok: true,
            json: jest.fn().mockResolvedValueOnce(mockEmail),
        });

        render(<ControlButton2 setUploadedFiles={mockSetUploadedFiles} />);

        await waitFor(() => {
            expect(screen.queryByText("Upload Models")).toBeInTheDocument();
        });
        expect(fetch).toHaveBeenCalledWith(expect.stringContaining("/get-email"), {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });
        expect(Swal.fire).not.toHaveBeenCalled();
    });

    test("fetchEmailAndDemographics handles missing email", async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            json: jest.fn().mockResolvedValueOnce({}),
        });

        render(<ControlButton2 setUploadedFiles={mockSetUploadedFiles} />);

        await waitFor(() => {
            expect(Swal.fire).toHaveBeenCalledWith(
                expect.objectContaining({
                    icon: "error",
                    title: "Please log in first",
                })
            );
        });
    });

    test("fetchEmailAndDemographics handles fetch error", async () => {
        fetch.mockRejectedValueOnce(new Error("Fetch error"));

        render(<ControlButton2 setUploadedFiles={mockSetUploadedFiles} />);

        await waitFor(() => {
            expect(Swal.fire).toHaveBeenCalledWith(
                expect.objectContaining({
                    icon: "error",
                    title: "Error",
                })
            );
        });
    });

    test("handleModelUploadClick triggers file input click", () => {
        render(<ControlButton2 setUploadedFiles={mockSetUploadedFiles} />);
        const uploadButton = screen.getByText("Upload Models");

        fireEvent.click(uploadButton);
        const fileInput = screen.getByTestId("file-input");

        expect(fileInput).toBeInTheDocument();
        expect(fileInput).toHaveAttribute("type", "file");
    });

    test("handleModelFileChange processes valid files and uploads them", async () => {
        const file = new File(["content"], "test_model.pkl", { type: "application/octet-stream" });
        fetch.mockResolvedValueOnce({ ok: true, json: jest.fn().mockResolvedValueOnce({}) });

        render(<ControlButton2 setUploadedFiles={mockSetUploadedFiles} />);
        const fileInput = screen.getByTestId("file-input");

        fireEvent.change(fileInput, { target: { files: [file] } });

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith(
                expect.stringContaining("/api/upload-model"),
                expect.objectContaining({ method: "POST" })
            );
            expect(localStorage.getItem("uploadedFiles")).toContain("test_model.pkl");
        });
    });

    test("handleDeleteFile removes file and calls delete API", async () => {
        localStorage.setItem("uploadedFiles", JSON.stringify(["test_model.pkl"]));
        const mockFileName = "test_model.pkl";

        fetch.mockResolvedValueOnce({ ok: true });

        render(<ControlButton2 setUploadedFiles={mockSetUploadedFiles} />);
        const deleteButton = screen.getByText("❌");

        fireEvent.click(deleteButton);

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith(
                expect.stringContaining("/api/delete-model"),
                expect.objectContaining({
                    method: "POST",
                    body: JSON.stringify(expect.objectContaining({ file_name: mockFileName })),
                })
            );
        });
        expect(localStorage.getItem("uploadedFiles")).not.toContain(mockFileName);
    });

    test("Modal displays correctly and closes on click", () => {
        render(<ControlButton2 setUploadedFiles={mockSetUploadedFiles} />);
        const uploadButton = screen.getByText("Upload Models");

        fireEvent.click(uploadButton);

        expect(screen.getByText("Model Upload Instructions")).toBeInTheDocument();
        const closeButton = screen.getByText("×");
        fireEvent.click(closeButton);

        expect(screen.queryByText("Model Upload Instructions")).not.toBeInTheDocument();
    });

    test("fetches current user email and uploaded files on mount", async () => {
        const mockEmailResponse = { email: "test@example.com" };
        const mockFiles = ["file1.pkl", "file2.pkl"];

        fetch.mockResolvedValueOnce({
            json: jest.fn().mockResolvedValue(mockEmailResponse),
        });

        localStorageMock.setItem("uploadedFiles", JSON.stringify(mockFiles));

        const { getByText } = render(<ControlButton2 setUploadedFiles={jest.fn()} />);

        await waitFor(() => expect(getByText("file1.pkl")).toBeInTheDocument());
        expect(getByText("file2.pkl")).toBeInTheDocument();
    });

    test("uploads valid .pkl files", async () => {
        const mockFile = new File(["content"], "validModel.pkl", { type: "application/octet-stream" });

        const { getByTestId, queryByText } = render(
            <ControlButton2 setUploadedFiles={jest.fn()} />
        );

        const fileInput = getByTestId("file-input");
        fireEvent.change(fileInput, { target: { files: [mockFile] } });

        await waitFor(() => {
            expect(queryByText("validModel.pkl")).toBeInTheDocument();
        });
    });

    test("rejects invalid file formats", async () => {
        const invalidFile = new File(["content"], "invalidModel.txt", { type: "text/plain" });

        const { getByTestId } = render(<ControlButton2 setUploadedFiles={jest.fn()} />);

        const fileInput = getByTestId("file-input");
        fireEvent.change(fileInput, { target: { files: [invalidFile] } });

        expect(global.alert).toHaveBeenCalledWith("Please upload a model in .pkl format.");
    });

    test("restricts upload to a maximum of 4 files", async () => {
        const mockFiles = [
            new File(["content"], "model1.pkl"),
            new File(["content"], "model2.pkl"),
            new File(["content"], "model3.pkl"),
            new File(["content"], "model4.pkl"),
            new File(["content"], "extraModel.pkl"),
        ];

        const { getByTestId } = render(<ControlButton2 setUploadedFiles={jest.fn()} />);

        const fileInput = getByTestId("file-input");
        fireEvent.change(fileInput, { target: { files: mockFiles } });

        expect(global.alert).toHaveBeenCalledWith("You can only upload 4 models.");
    });

    test("deletes a file and updates the UI", async () => {
        localStorageMock.setItem("uploadedFiles", JSON.stringify(["file1.pkl", "file2.pkl"]));

        const { getByText, queryByText } = render(<ControlButton2 setUploadedFiles={jest.fn()} />);

        fireEvent.click(getByText("❌", { selector: ".delete-file-btn" }));

        await waitFor(() => {
            expect(queryByText("file1.pkl")).not.toBeInTheDocument();
        });

        const updatedFiles = JSON.parse(localStorageMock.getItem("uploadedFiles"));
        expect(updatedFiles).not.toContain("file1.pkl");
    });

    test("opens and closes the modal", () => {
        const { getByText, queryByText } = render(<ControlButton2 setUploadedFiles={jest.fn()} />);

        const uploadButton = getByText("Upload Models");
        fireEvent.click(uploadButton);

        expect(queryByText("Model Upload Instructions")).toBeInTheDocument();

        const closeButton = getByText("×");
        fireEvent.click(closeButton);

        expect(queryByText("Model Upload Instructions")).not.toBeInTheDocument();
    });

    test("shows error alert if fetching email fails", async () => {
        fetch.mockRejectedValueOnce(new Error("Network error"));

        render(<ControlButton2 setUploadedFiles={jest.fn()} />);

        await waitFor(() => {
            expect(global.alert).toHaveBeenCalledWith(
                "An error occurred while fetching your email. Please try again later."
            );
        });
    });

    test("shows an error if email is missing from API response", async () => {
        fetch.mockResolvedValueOnce({
            json: jest.fn().mockResolvedValue({}),
        });

        render(<ControlButton2 setUploadedFiles={jest.fn()} />);

        await waitFor(() => {
            expect(global.alert).toHaveBeenCalledWith(
                "You need to log in to access this page."
            );
        });
    });

    test("clicking modal's Upload Model button triggers file input", async () => {
        const { getByText } = render(<ControlButton2 setUploadedFiles={jest.fn()} />);

        fireEvent.click(getByText("Upload Models"));
        fireEvent.click(getByText("Upload Model(s)"));

        expect(fetch).not.toHaveBeenCalled(); // Ensure no uploads start prematurely
    });

    test("rejects duplicate filenames during upload", async () => {
        const mockFiles = [
            new File(["content"], "file1.pkl"),
            new File(["content"], "file1.pkl"),
        ];

        const { getByTestId } = render(<ControlButton2 setUploadedFiles={jest.fn()} />);

        const fileInput = getByTestId("file-input");
        fireEvent.change(fileInput, { target: { files: mockFiles } });

        expect(global.alert).toHaveBeenCalledWith("File with name file1.pkl already uploaded.");
    });

    test("does not allow uploading 'model.pkl'", async () => {
        const mockFile = new File(["content"], "model.pkl", { type: "application/octet-stream" });

        const { getByTestId } = render(<ControlButton2 setUploadedFiles={jest.fn()} />);

        const fileInput = getByTestId("file-input");
        fireEvent.change(fileInput, { target: { files: [mockFile] } });

        expect(global.alert).toHaveBeenCalledWith("You cannot upload a file named model.pkl.");
    });

    test("ensures modal renders with correct styles", async () => {
        const { getByText, getByTestId } = render(<ControlButton2 setUploadedFiles={jest.fn()} />);

        fireEvent.click(getByText("Upload Models"));

        const modal = getByTestId("modal");
        expect(modal).toHaveStyle("backdrop-filter: blur(5px)");
    });


    test("handles empty localStorage gracefully", () => {
        localStorageMock.removeItem("uploadedFiles");

        const { queryByText } = render(<ControlButton2 setUploadedFiles={jest.fn()} />);

        expect(queryByText("file1.pkl")).not.toBeInTheDocument();
    });
});
