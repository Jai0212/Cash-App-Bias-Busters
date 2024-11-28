// AboutPage.test.jsx
import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import AboutPage from "../src/pages/AboutPage/AboutPage";

test("renders AboutPage and verifies key elements", () => {
  render(<AboutPage />);

  // Verify header
  const header = screen.getByRole("heading", {
    level: 1,
    name: /About BIAS BUSTERS/i,
  });
  expect(header).toBeInTheDocument();

  // Verify paragraphs
  const paragraph1 = screen.getByText(/We are proud to announce/i);
  const paragraph2 = screen.getByText(/Our feedback so far has been great/i);
  expect(paragraph1).toBeInTheDocument();
  expect(paragraph2).toBeInTheDocument();

  // Verify key features section
  const keyFeaturesHeader = screen.getByRole("heading", {
    level: 3,
    name: /Key Features/i,
  });
  expect(keyFeaturesHeader).toBeInTheDocument();

  // Verify card titles
  const cardTitles = [
    "1. Bias and Accuracy Measurement",
    "2. Visualization",
    "3. Static Data Testing",
  ];
  cardTitles.forEach((title) => {
    const cardTitle = screen.getByText(title);
    expect(cardTitle).toBeInTheDocument();
  });

  // Verify footer
  const footerText = screen.getByText(/CashApp BIAS BUSTERS/i);
  const pressReleaseDate = screen.getByText(
    /Press Release - 7 November, 2024/i
  );
  expect(footerText).toBeInTheDocument();
  expect(pressReleaseDate).toBeInTheDocument();
});
