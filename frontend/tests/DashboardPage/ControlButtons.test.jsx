import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import ControlButtons from "../../src/pages/DashboardPage/ControlButtons/ControlButtons";
import Swal from 'sweetalert2'; // Make sure Swal is imported correctly


jest.mock('sweetalert2');
jest.mock("../../src/envConfig", () => ({
  envConfig: jest.fn().mockReturnValue('http://mock-backend-url.com'),
}));

describe('ControlButtons Component', () => {
  let onDownloadMock;

  beforeEach(() => {
    onDownloadMock = jest.fn();
    // Clear mock calls before each test
    Swal.fire.mockClear();
  });

  test('renders correctly and displays buttons', () => {
    render(<ControlButtons onDownload={onDownloadMock} />);

    // Check if buttons are rendered
    expect(screen.getByLabelText(/Import Models/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Import Dataset/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Download Graph/i)).toBeInTheDocument();
  });

  test('opens model upload modal on "Import Models" click', async () => {
    render(<ControlButtons onDownload={onDownloadMock} />);

    const importModelButton = screen.getByLabelText(/Import Models/i);
    fireEvent.click(importModelButton);

    // Verify modal opens
    expect(screen.getByText(/Model Upload Instructions/i)).toBeInTheDocument();
  });

  test('opens dataset upload modal on "Import Dataset" click', async () => {
    render(<ControlButtons onDownload={onDownloadMock} />);

    const importDatasetButton = screen.getByLabelText(/Import Dataset/i);
    fireEvent.click(importDatasetButton);

    // Verify modal opens
    expect(screen.getByText(/Dataset Upload Instructions/i)).toBeInTheDocument();
  });

  test('uploads model file successfully', async () => {
    // Mock the API response
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Model uploaded successfully!' }),
    });

    render(<ControlButtons onDownload={onDownloadMock} />);

    // Trigger the model file input and upload process
    fireEvent.click(screen.getByLabelText(/Import Models/i));
    fireEvent.change(screen.getByLabelText(/Choose model file/i), {
      target: { files: [new File([''], 'model.pkl', { type: 'application/octet-stream' })] },
    });

    // Wait for the alert to show up and confirm it
    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith('http://mock-backend-url.com/api/upload-model', expect.anything()));
    await waitFor(() => expect(Swal.fire).toHaveBeenCalledWith({
      icon: 'success',
      title: 'Success',
      text: 'Model uploaded successfully!',
    }));
  });

  test('uploads dataset file successfully', async () => {
    // Mock the API response
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Dataset uploaded successfully!' }),
    });

    render(<ControlButtons onDownload={onDownloadMock} />);

    // Trigger the dataset file input and upload process
    fireEvent.click(screen.getByLabelText(/Import Dataset/i));
    fireEvent.change(screen.getByLabelText(/Choose dataset file/i), {
      target: { files: [new File([''], 'data.csv', { type: 'text/csv' })] },
    });

    // Wait for the alert to show up and confirm it
    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith('http://mock-backend-url.com/api/upload-data', expect.anything()));
    await waitFor(() => expect(Swal.fire).toHaveBeenCalledWith({
      icon: 'success',
      title: 'Success',
      text: 'Dataset uploaded successfully!',
    }));
  });

  test('shows error when model upload fails', async () => {
    // Mock failed API response
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Upload failed' }),
    });

    render(<ControlButtons onDownload={onDownloadMock} />);

    // Trigger the model file input and upload process
    fireEvent.click(screen.getByLabelText(/Import Models/i));
    fireEvent.change(screen.getByLabelText(/Choose model file/i), {
      target: { files: [new File([''], 'model.pkl', { type: 'application/octet-stream' })] },
    });

    // Wait for the error alert to show up
    await waitFor(() => expect(Swal.fire).toHaveBeenCalledWith({
      icon: 'error',
      title: 'Error',
      text: 'Error uploading model: Upload failed',
    }));
  });

  test('shows error when dataset upload fails', async () => {
    // Mock failed API response
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Upload failed' }),
    });

    render(<ControlButtons onDownload={onDownloadMock} />);

    // Trigger the dataset file input and upload process
    fireEvent.click(screen.getByLabelText(/Import Dataset/i));
    fireEvent.change(screen.getByLabelText(/Choose dataset file/i), {
      target: { files: [new File([''], 'data.csv', { type: 'text/csv' })] },
    });

    // Wait for the error alert to show up
    await waitFor(() => expect(Swal.fire).toHaveBeenCalledWith({
      icon: 'error',
      title: 'Error',
      text: 'Error uploading dataset: Upload failed',
    }));
  });

  test('handles missing user email correctly', async () => {
    // Mock fetch to return no email
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ email: '' }),
    });

    render(<ControlButtons onDownload={onDownloadMock} />);

    // Wait for the error alert to show up
    await waitFor(() => expect(Swal.fire).toHaveBeenCalledWith({
      icon: 'error',
      title: 'Please log in first',
      text: 'You need to log in to access this page.',
    }));
  });
});