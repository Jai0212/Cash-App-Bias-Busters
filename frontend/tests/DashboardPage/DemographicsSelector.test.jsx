import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import DemographicsSelector from "../../src/pages/DashboardPage/Demographics/DemographicsSelector";

// Mock props
const mockDemographics = ["Demographic 1", "Demographic 2"];
const mockDemographicValues = ["Value 1", "Value 2", "Value 3", "Value 4"];
const mockHandleDemographicChange = jest.fn();
const mockHandleValueChange = jest.fn();
const mockHandleSecondDemographicChange = jest.fn();
const mockHandleGenerate = jest.fn();

const defaultProps = {
  demographics: mockDemographics,
  selectedDemographic: "",
  handleDemographicChange: mockHandleDemographicChange,
  selectedValues: [],
  handleValueChange: mockHandleValueChange,
  demographicValues: mockDemographicValues,
  selectedSecondValues: [],
  secondSelectedDemographic: "",
  handleSecondDemographicChange: mockHandleSecondDemographicChange,
  secondDemographicValues: mockDemographicValues,
  handleGenerate: mockHandleGenerate,
  tabIndex: 1,
};

test("renders DemographicsSelector component correctly", () => {
  render(<DemographicsSelector {...defaultProps} />);

  // Check if demographics select options are rendered
  //   const demographicSelect = screen.getByLabelText("Select Demographic");
  //   fireEvent.change(demographicSelect, { target: { value: "Demographic 1" } });

  //   expect(demographicSelect).toBeInTheDocument();
  //   expect(demographicSelect).toHaveValue("Demographic 1");
  //   expect(mockHandleDemographicChange).toHaveBeenCalledTimes(1);

  // Check if second demographic select is rendered
  //   const secondDemographicSelect = screen.queryByLabelText(
  //     "Select 2nd Demographic"
  //   );
  //   expect(secondDemographicSelect).toBeInTheDocument();

  //   // Check if generate button is rendered
  //   const generateButton = screen.getByText("Generate");
  //   expect(generateButton).toBeInTheDocument();
});

test("renders demographic values correctly", () => {
  const updatedProps = {
    ...defaultProps,
    selectedDemographic: "Demographic 1",
    selectedValues: ["Value 1"],
    secondSelectedDemographic: "Demographic 2",
    selectedSecondValues: ["Value 2"],
  };

  render(<DemographicsSelector {...updatedProps} />);

  // Check if first demographic values are rendered
  const firstDemographicValues = screen.getAllByRole("combobox")[1];
  expect(firstDemographicValues).toBeInTheDocument();
  expect(firstDemographicValues).toHaveValue("Value 1");

  // Check if second demographic values are rendered
  const secondDemographicValues = screen.getAllByRole("combobox")[5];
  expect(secondDemographicValues).toBeInTheDocument();
  expect(secondDemographicValues).toHaveValue("Demographic 2");
});
