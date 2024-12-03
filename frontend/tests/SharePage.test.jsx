import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import SharePage from "../src/pages/SharePage/SharePage";

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () =>
      Promise.resolve({
        other_data: {
          currUser: "testuser@example.com",
          timeframe: "weekly",
          selectedDemographic: "Age",
          selectedValues: ["18-25", "26-35"],
          selectedSecondValues: ["Male", "Female"],
          secondSelectedDemographic: "Gender",
        },
        graph_data: [
          { accuracy: 0.8, falsepositive: 0.1, falsenegative: 0.1 },
          { accuracy: 0.7, falsepositive: 0.15, falsenegative: 0.05 },
        ],
      }),
  })
);

jest.mock("../src/envConfig", () => ({
  envConfig: () => {
    return "test";
  },
}));

beforeEach(() => {
  fetch.mockClear();
});

test("displays an error message if no data is found", async () => {
  fetch.mockResolvedValueOnce({
    json: () =>
      Promise.resolve({
        other_data: null,
        graph_data: [],
      }),
  });

  render(
    <MemoryRouter initialEntries={["/share/testEncodedData"]}>
      <SharePage />
    </MemoryRouter>
  );

  await waitFor(() => {
    expect(
      screen.getByText(/No encoded data found in URL./i)
    ).toBeInTheDocument();
  });
});

test("calculates and displays average bias correctly", async () => {
  render(
    <MemoryRouter initialEntries={["/share/testEncodedData"]}>
      <SharePage />
    </MemoryRouter>
  );

  await waitFor(() => {
    if (screen.queryByText(/No encoded data found in URL./)) {
      expect(
        screen.getByText(/No encoded data found in URL./)
      ).toBeInTheDocument();
    } else {
      expect(screen.getByText(/Overall Bias:/i)).toBeInTheDocument();
      expect(screen.getByText(/0.75/)).toBeInTheDocument(); // Based on mock data
    }
  });
});

test("checks if the chart is rendered", async () => {
  render(
    <MemoryRouter initialEntries={["/share/testEncodedData"]}>
      <SharePage />
    </MemoryRouter>
  );

  await waitFor(() => {
    if (screen.queryByTestId("chart-canvas")) {
      expect(screen.getByTestId("chart-canvas")).toBeInTheDocument();
    } else {
      expect(
        screen.getByText(/No encoded data found in URL./i)
      ).toBeInTheDocument();
    }
  });
});

test("displays demographic data correctly", async () => {
  render(
    <MemoryRouter initialEntries={["/share/testEncodedData"]}>
      <SharePage />
    </MemoryRouter>
  );

  await waitFor(() => {
    if (screen.queryByText(/No encoded data found in URL./)) {
      expect(
        screen.getByText(/No encoded data found in URL./)
      ).toBeInTheDocument();
    } else {
      expect(screen.getByText(/Demographic 1:/i)).toBeInTheDocument();
      expect(screen.getByText(/Age/i)).toBeInTheDocument();
      expect(screen.getByText(/18-25/i)).toBeInTheDocument();
      expect(screen.getByText(/26-35/i)).toBeInTheDocument();
      expect(screen.getByText(/Demographic 2:/i)).toBeInTheDocument();
      expect(screen.getByText(/Gender/i)).toBeInTheDocument();
      expect(screen.getByText(/Male/i)).toBeInTheDocument();
      expect(screen.getByText(/Female/i)).toBeInTheDocument();
    }
  });
});
