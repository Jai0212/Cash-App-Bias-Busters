import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { act } from "react-dom/test-utils";
import ChatbotComponent from "../../src/pages/DashboardPage/Chatbot/Chatbot.jsx"; // Adjust path as necessary

// Mock fetch to simulate chatbot responses
global.fetch = jest.fn(() =>
    Promise.resolve({
        json: () => Promise.resolve({ message: "Test response" }),
    })
);

jest.mock("../../src/envConfig", () => ({
    envConfig: () => "test",
}));


// Mock getResponse function
const getResponse = (message) => {
    const lowerMessage = message.toLowerCase();
    const keywordAnswers = [
        { keyword: "  ", answer: "Hi! How can I help you today?" },
        { keyword: "started", answer: "To get started, you can see a red point blinking on the screen near 'Import Model.' It will guide you through a walkthrough. If you have any questions, feel free to ask!" },
        { keyword: "chart", answer: "Make sure you've selected a demographic and values. If data is still missing, try choosing a different demographic or combination of values." },
        { keyword: "error", answer: "If you're seeing an error, please check if your data input is correct or try refreshing the page." },
        { keyword: "thank", answer: "Come on, Navnoor! You only created me. Rather, I should thank you for making me part of the Bias Busters project!" },
    ];

    const found = keywordAnswers.find((item) => lowerMessage.includes(item.keyword));
    return found ? found.answer : "I'm sorry, I didn't understand that. Can you please clarify?";
};

beforeEach(() => {
    fetch.mockClear(); // Reset the mock fetch function before each test
});

test("renders chatbot with initial greeting", async () => {
    render(<ChatbotComponent />);

    // Wait for the greeting message to appear in the document
    await waitFor(() => {
        expect(screen.getByText("Hi! How can I help you today?")).toBeInTheDocument();
    });
});

test("closes the chatbot when close button is clicked", () => {
    const closeChatbot = jest.fn();
    render(<ChatbotComponent closeChatbot={closeChatbot} />);

    // Simulate clicking the close button
    fireEvent.click(screen.getByRole("button", { name: /×/ }));

    // Verify that the closeChatbot function was called
    expect(closeChatbot).toHaveBeenCalled();
});

test("provides appropriate response for 'started' keyword", () => {
    const message = "How do I get started?";
    const response = getResponse(message);
    expect(response).toBe(
        "To get started, you can see a red point blinking on the screen near 'Import Model.' It will guide you through a walkthrough. If you have any questions, feel free to ask!"
    );
});

test("provides default response for unknown keyword", () => {
    const message = "unknown keyword";
    const response = getResponse(message);
    expect(response).toBe("I'm sorry, I didn't understand that. Can you please clarify?");
});

test("returns correct response for 'chart' keyword", () => {
    const message = "Can you explain the chart?";
    const response = getResponse(message);
    expect(response).toBe(
        "Make sure you've selected a demographic and values. If data is still missing, try choosing a different demographic or combination of values."
    );
});

test('renders the chatbot component with a custom header title', () => {
    render(<ChatbotComponent closeChatbot={() => {}} />);
    expect(screen.getByText((content, element) => {
        return element?.textContent === 'Conversation with SupportBot';
    })).toBeInTheDocument();
});

describe("ChatbotComponent Tests", () => {
    const closeChatbotMock = jest.fn();

    beforeEach(() => {
        closeChatbotMock.mockClear(); // Reset mock before each test
    });

    test("renders the chatbot UI with correct styles", () => {
        render(<ChatbotComponent closeChatbot={closeChatbotMock} />);

        // Check if the chatbot container is rendered
        const chatbotContainer = screen.getByRole("dialog");
        expect(chatbotContainer).toBeInTheDocument();
        expect(chatbotContainer).toHaveStyle("position: fixed");
        expect(chatbotContainer).toHaveStyle("background-color: rgba(0, 0, 0, 0.5)");
    });

    test("renders the close button with correct styles", () => {
        render(<ChatbotComponent closeChatbot={closeChatbotMock} />);

        // Verify the close button
        const closeButton = screen.getByRole("button", { name: /×/ });
        expect(closeButton).toBeInTheDocument();
        expect(closeButton).toHaveStyle("position: absolute");
        expect(closeButton).toHaveStyle("top: 1px");
        expect(closeButton).toHaveStyle("left: 250px");
        expect(closeButton).toHaveStyle("color: #4caf50");
    });

    test("closes the chatbot when the close button is clicked", () => {
        render(<ChatbotComponent closeChatbot={closeChatbotMock} />);

        // Simulate clicking the close button
        const closeButton = screen.getByRole("button", { name: /×/ });
        fireEvent.click(closeButton);

        // Verify that the closeChatbot function is called
        expect(closeChatbotMock).toHaveBeenCalledTimes(1);
    });

});
