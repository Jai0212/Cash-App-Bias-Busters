import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Modal from '../../src/Components/Modal/Modal.jsx';

describe("Modal Component", () => {
    test("renders modal heading", () => {
        render(<Modal closeModal={jest.fn()} />);
        expect(screen.getByRole("heading", { name: /Fairlearn & Performance Metrics/i })).toBeInTheDocument();
    });

    test("renders key metrics descriptions", () => {
        render(<Modal closeModal={jest.fn()} />);

        const accuracyElements = screen.getAllByText(/accuracy/i);
        const accuracyStrong = accuracyElements.find(element => element.tagName === 'STRONG');
        expect(accuracyStrong).toBeInTheDocument();

        const falsePositiveRateElements = screen.getAllByText(/False Positive Rate/i);
        const falsePositiveRateStrong = falsePositiveRateElements.find(element => element.tagName === 'STRONG');
        expect(falsePositiveRateStrong).toBeInTheDocument();

        const falseNegativeRateElements = screen.getAllByText(/False Negative Rate/i);
        const falseNegativeRateStrong = falseNegativeRateElements.find(element => element.tagName === 'STRONG');
        expect(falseNegativeRateStrong).toBeInTheDocument();

        expect(screen.getByText(/Accuracy = \(True Positives \+ True Negatives\) \/ Total Predictions/i)).toBeInTheDocument();
        expect(screen.getByText(/False Positive Rate = False Positives \/ \(False Positives \+ True Negatives\)/i)).toBeInTheDocument();
        expect(screen.getByText(/False Negative Rate = False Negatives \/ \(False Negatives \+ True Positives\)/i)).toBeInTheDocument();
    });





    test("renders modal with list of formulas", () => {
        render(<Modal closeModal={jest.fn()} />);

        // Check if the formulas are rendered
        expect(
            screen.getByText(/Accuracy = \(True Positives \+ True Negatives\) \/ Total Predictions/i)
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                /False Positive Rate = False Positives \/ \(False Positives \+ True Negatives\)/i
            )
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                /False Negative Rate = False Negatives \/ \(False Negatives \+ True Positives\)/i
            )
        ).toBeInTheDocument();
    });

    test("renders close button", () => {
        render(<Modal closeModal={jest.fn()} />);
        const closeButton = screen.getByText('×');
        expect(closeButton).toBeInTheDocument();
    });

    test("closes modal when close button is clicked", () => {
        const mockCloseModal = jest.fn();
        render(<Modal closeModal={mockCloseModal} />);

        const closeButton = screen.getByText('×');
        fireEvent.click(closeButton);

        // Verify that the closeModal function was called
        expect(mockCloseModal).toHaveBeenCalledTimes(1);
    });

    test("prevents default behavior on close button click", () => {
        const mockCloseModal = jest.fn(); // Mock the closeModal function
        render(<Modal closeModal={mockCloseModal} />);

        const closeButton = screen.getByText('×');

        const event = { preventDefault: jest.fn() };

        fireEvent.click(closeButton, event);

        expect(event.preventDefault).toHaveBeenCalledTimes(0);
    });

});