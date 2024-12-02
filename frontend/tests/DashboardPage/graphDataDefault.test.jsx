import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import graphDataDefault from "../../src/pages/DashboardPage/data/graphDataDefault";

// Mock Component to use graphDataDefault
const MockComponent = () => (
  <div>
    {graphDataDefault.map((item, index) => (
      <div key={index} data-testid="demographic-item">
        <p>{item.feature1}</p>
        <p>{item.feature2}</p>
        <p>{item.accuracy}</p>
        <p>{item.falsepositive}</p>
        <p>{item.falsenegative}</p>
        <p>{item.combination_label}</p>
      </div>
    ))}
  </div>
);

test("renders graphDataDefault correctly", () => {
  render(<MockComponent />);

  // Check if all demographic items are rendered
  const demographicItems = screen.getAllByTestId("demographic-item");
  expect(demographicItems).toHaveLength(graphDataDefault.length);

  // Check if the content inside the first demographic item is correct
  const firstItem = demographicItems[0];
  expect(firstItem).toHaveTextContent("Demographic 1");
  expect(firstItem).toHaveTextContent("Demographic 2");
  expect(firstItem).toHaveTextContent("0");
  expect(firstItem).toHaveTextContent("Demographic 1 Demographic 2");
});
