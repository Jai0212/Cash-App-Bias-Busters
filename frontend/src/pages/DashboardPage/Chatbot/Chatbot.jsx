import React, { useState } from "react";
import { Chatbot } from "react-chatbot-kit";
import { ThemeProvider } from "styled-components";
import "react-chatbot-kit/build/main.css"; // Ensure this is imported

// Define the config object
const config = {
    botName: "SupportBot",
    initialMessages: [
        {
            message: "Hi! How can I help you today?",
            trigger: "options",
        },
    ],
    state: {},
    renderChatHeader: () => (
        <div
            style={{
                width: "100%",
                backgroundColor: "#4caf50",
                color: "#fff",
                padding: "10px",
                fontSize: "18px",
                fontWeight: "bold",
                textAlign: "center",
            }}
        >
            Support Chat
        </div>
    ),
    botAvatar: "https://link-to-your-bot-avatar.png", // Optional: Add a bot avatar
    userAvatar: "https://link-to-your-user-avatar.png", // Optional: Add a user avatar
};


// MessageParser class to match user input with predefined keywords
class MessageParser {
    constructor(actionProvider) {
        this.actionProvider = actionProvider;
    }

    parse(message) {
        const lowerMessage = message.toLowerCase();
        const keywordAnswers = [
            { keyword: "time", answer: "You can change the timeframe by selecting one of the buttons (1 Day, 1 Week, 1 Month, 1 Year) at the top of the chart." },
            { keyword: "chart", answer: "Make sure you've selected a demographic and values. If data is still missing, try choosing a different demographic or combination of values." },
            { keyword: "error", answer: "If you're seeing an error, please check if your data input is correct or try refreshing the page." },
            { keyword: "help", answer: "I can assist you with general questions, charts, or errors. Just ask me!" },
            { keyword: "report", answer: "If you'd like to report an issue, please describe it, and I’ll assist you further." },
            { keyword: "data", answer: "If you're missing data, please make sure the correct demographic and values are selected. You may need to update or upload new data." },
            { keyword: "demographic", answer: "Demographics refer to categories such as age, gender, location, and other similar data points. Please choose the relevant demographic for your chart." },
            { keyword: "refresh", answer: "You can refresh the page by clicking the refresh button or pressing Ctrl + R on your keyboard." },
            { keyword: "upload", answer: "To upload data, click the 'Upload' button and select your file. Ensure the file format is supported (CSV, Excel, etc.)." },
            { keyword: "save", answer: "You can save your chart by clicking the 'Save' button. You may also export the data if needed." },
            { keyword: "login", answer: "To log in, please enter your credentials on the login page. If you don't have an account, you can sign up for one." },
            { keyword: "logout", answer: "To log out, simply click the logout button at the top right of the page." },
            { keyword: "dashboard", answer: "The dashboard allows you to view and analyze your data. You can select different charts and demographics to explore insights." },
            { keyword: "filter", answer: "To filter the data, use the filter options provided next to the chart. You can filter by date range, demographic, or value type." },
            { keyword: "download", answer: "To download the data, click the 'Download' button and select your preferred file format (CSV, Excel, etc.)." },
            { keyword: "support", answer: "For additional support, you can visit our help center or contact customer service via email." },
            { keyword: "contact", answer: "To contact support, please send us an email at support@example.com." },
            { keyword: "feature", answer: "We are constantly improving our platform. If you have a feature request, feel free to share it with us!" },
            { keyword: "settings", answer: "You can update your account settings by clicking on your profile icon and selecting 'Settings'." },
            { keyword: "performance", answer: "If you're experiencing performance issues, try clearing your browser cache or using a different browser." },
            { keyword: "issues", answer: "If you're encountering issues, please describe the problem, and I'll help troubleshoot or escalate it to support." }
        ];

        const matchedKeyword = keywordAnswers.find((qa) => lowerMessage.includes(qa.keyword));

        if (matchedKeyword) {
            this.actionProvider.addMessageToBot(matchedKeyword.answer);
        } else {
            this.actionProvider.addMessageToBot("Sorry, I didn't understand that. Can you clarify?");
        }
    }
}

// ActionProvider class to handle user input actions
class ActionProvider {
    constructor(createChatBotMessage, setStateFunc, createClientMessage) {
        this.createChatBotMessage = createChatBotMessage;
        this.setState = setStateFunc;
        this.createClientMessage = createClientMessage;
    }

    addMessageToBot(message) {
        const botMessage = this.createChatBotMessage(message);
        this.setState((prevState) => ({
            ...prevState,
            messages: [...prevState.messages, botMessage],
        }));
    }

    handleUnknown() {
        const message = this.createChatBotMessage("Sorry, I didn't understand that. Can you rephrase?");
        this.setState((prevState) => ({
            ...prevState,
            messages: [...prevState.messages, message],
        }));
    }
}

const ChatbotComponent = ({ closeChatbot }) => {
    // const [isChatbotOpen, setIsChatbotOpen] = useState(true); // Track if the chatbot is open

    const handleClose = (e) => {
        e.preventDefault(); // Prevent any default behavior (like form submission)
        // setIsChatbotOpen(false); // Close the chatbot
        closeChatbot();
    };

    const theme = {
        background: "#f5f8fb",
        fontFamily: "Arial, sans-serif",
        headerBgColor: "#4caf50 !important", // Add !important
        headerFontColor: "#fff",
        headerFontSize: "18px",
        botBubbleColor: "#4caf50 !important", // Add !important
        botFontColor: "#fff",
        userBubbleColor: "#fff",
        userFontColor: "#4caf50",
    };

    return (
        // isChatbotOpen && (
            <ThemeProvider theme={theme}>
                <div
                    style={{
                        position: "fixed",
                        top: "20px", // Adjusted to be slightly lower from the top
                        left: "20px", // Adjusted to be slightly from the left
                        right: "0",
                        bottom: "0",
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                        backdropFilter: "blur(10px)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: "9999",

                    }}
                >
                    <div
                        style={{
                            width: "275px",
                            height: "500px",
                            borderRadius: "8px",
                            backgroundColor: "#fff",
                            overflow: "hidden",
                            position: "relative",
                        }}
                    >
                        <button
                            onClick={handleClose}
                            style={{
                                position: "absolute",
                                top: "1px", // Adjusted button position
                                left: "250px", // Changed to left instead of right
                                backgroundColor: "transparent",
                                border: "none",
                                fontSize: "25px", // Increased button size
                                color: "#4caf50",
                                cursor: "pointer",
                                zIndex: "10000", // Ensure it is on top
                            }}
                        >
                            &times;
                        </button>
                        <Chatbot
                            config={config}
                            messageParser={MessageParser}
                            actionProvider={ActionProvider}
                            floating={false}
                            botDelay={300}
                            userDelay={200}
                            headerTitle="Support Bot"
                            width="100%"
                            height="100%"
                        />
                    </div>
                </div>
            </ThemeProvider>
        // )
    );
};

export default ChatbotComponent;
