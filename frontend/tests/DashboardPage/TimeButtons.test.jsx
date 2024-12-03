import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import TimeButtons from "../../src/pages/DashboardPage/TimeButtons/TimeButtons"; // Adjust the path

describe("TimeButtons Component", () => {
    const mockHandleTimeframeChange = jest.fn();

    const defaultProps = {
        handleTimeframeChange: mockHandleTimeframeChange,
        timeframe: "day", // default selected timeframe
        lastTabIndex: 10, // starting tabIndex for the buttons
    };

    beforeEach(() => {
        jest.clearAllMocks(); // Clear any mock calls between tests
    });

    test("renders the correct number of buttons", () => {
        render(<TimeButtons {...defaultProps} />);
        const buttons = screen.getAllByRole("button");
        expect(buttons).toHaveLength(4); // Expecting 4 buttons: day, week, month, year
    });

    test("updates active button class when a different button is clicked", () => {
        const { rerender } = render(
            <TimeButtons
                handleTimeframeChange={mockHandleTimeframeChange}
                timeframe="day" // Initial timeframe set to "day"
                lastTabIndex={10}
            />
        );

        // Before clicking, only "1 Day" should have the active class
        expect(screen.getByText(/1 Day/i)).toHaveClass("active-button");
        expect(screen.getByText(/1 Week/i)).not.toHaveClass("active-button");

        // Click the "1 Week" button
        fireEvent.click(screen.getByText(/1 Week/i));

        // Now, "1 Week" should have the active class
        expect(screen.getByText(/1 Week/i)).toHaveClass("active-button");
        expect(screen.getByText(/1 Day/i)).not.toHaveClass("active-button");

        // Simulate state change for re-render with updated props
        rerender(
            <TimeButtons
                handleTimeframeChange={mockHandleTimeframeChange}
                timeframe="week" // Update the timeframe to "week"
                lastTabIndex={10}
                />
            );

        // After re-rendering, check if the button classes are correct
        expect(screen.getByText(/1 Week/i)).toHaveClass("active-button");
        expect(screen.getByText(/1 Day/i)).not.toHaveClass("active-button");
    });

    test("calls handleTimeframeChange when a button is clicked", () => {
        render(<TimeButtons {...defaultProps} />);

        const weekButton = screen.getByText(/1 Week/i);
        fireEvent.click(weekButton);

        expect(mockHandleTimeframeChange).toHaveBeenCalledTimes(1);
        expect(mockHandleTimeframeChange).toHaveBeenCalledWith("week");
    });

    test("updates active button class when a different button is clicked", () => {
        render(<TimeButtons {...defaultProps} />);

        // Before clicking, only "1 Day" should have the active class
        expect(screen.getByText(/1 Day/i)).toHaveClass("active-button");
        expect(screen.getByText(/1 Week/i)).not.toHaveClass("active-button");

        // Click the "1 Week" button
        fireEvent.click(screen.getByText(/1 Week/i));

        // Now, "1 Week" should have the active class
        expect(screen.getByText(/1 Week/i)).toHaveClass("active-button");
        expect(screen.getByText(/1 Day/i)).not.toHaveClass("active-button");
    });

    test("ensures the correct tabIndex for each button", () => {
        render(<TimeButtons {...defaultProps} />);

        const dayButton = screen.getByText(/1 Day/i);
        const weekButton = screen.getByText(/1 Week/i);
        const monthButton = screen.getByText(/1 Month/i);
        const yearButton = screen.getByText(/1 Year/i);

        expect(dayButton).toHaveAttribute("tabIndex", "11"); // lastTabIndex + 1
        expect(weekButton).toHaveAttribute("tabIndex", "12"); // lastTabIndex + 2
        expect(monthButton).toHaveAttribute("tabIndex", "13"); // lastTabIndex + 3
        expect(yearButton).toHaveAttribute("tabIndex", "14"); // lastTabIndex + 4
    });

    test("correctly handles the scenario where no timeframe is passed", () => {
        render(<TimeButtons {...{ ...defaultProps, timeframe: undefined }} />);

        // If no timeframe is selected, no button should have the 'active-button' class
        expect(screen.getByText(/1 Day/i)).not.toHaveClass("active-button");
        expect(screen.getByText(/1 Week/i)).not.toHaveClass("active-button");
        expect(screen.getByText(/1 Month/i)).not.toHaveClass("active-button");
        expect(screen.getByText(/1 Year/i)).not.toHaveClass("active-button");
    });
});
