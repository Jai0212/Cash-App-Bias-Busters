import React, { useState, useEffect, useRef } from "react";
import ChartComponent2 from "./ChartComponent2.jsx";
import ControlButton2 from "./ControlButtons2";
import UserNavbar from "./Components/UserNavbar";
import "./Dashboard2.css";

const Dashboard2 = () => {
    const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

    const [currUser, setCurrUser] = useState("");
    const [graphData, setGraphData] = useState({});
    const [isChartVisible, setIsChartVisible] = useState(true);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [generationResults, setGenerationResults] = useState([]);

    const chartRef = useRef(null);

    const fetchEmailAndDemographics = async () => {
        const url = "http://localhost:11355/api/get-email";
        const token = localStorage.getItem('token');

        try {
            const emailResponse = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });

            const emailData = await emailResponse.json();
            setCurrUser(emailData.email || "");

        } catch (error) {
            console.error("Error fetching email:", error);
        }
    };

    useEffect(() => {
        fetchEmailAndDemographics();
    }, []);

    useEffect(() => {
        setGraphData({
            labels: ["Model 1", "Model 2", "Model 3", "Model 4", "Model 5"],
            datasets: [
                {
                    label: "Generated Data",
                    data: [0.3, 0.8, 0.7],
                    backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
                },
            ],
        });
    }, []);

    const handleGenerateClick = async () => {
        if (!currUser) {
            alert("Error: No current user found.");
            return;
        }

        try {
            const response = await fetch(`${VITE_BACKEND_URL}/api/generate-for-all-models`, {
                method: "POST",
                body: new URLSearchParams({
                    curr_user: currUser,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                alert("Error generating models: " + errorData.error);
                return;
            }

            const data = await response.json();
            setGenerationResults(data);
            console.log("Generation results:", data);
        } catch (error) {
            console.error("Error during model generation:", error);
            alert("Error during model generation: " + error.message);
        }
    };

    return (
        <div className="dashboard-main">

            {/* Pass setUploadedFiles to ControlButton2 */}
            <ControlButton2 setUploadedFiles={setUploadedFiles} />


            <div className="action-button-container">
                <button onClick={handleGenerateClick} className="generate-btn">
                    Generate
                </button>
            </div>

            {generationResults.length > 0 && <div className="result-section">
                {generationResults.length > 0 && (
                    <ul>
                        {generationResults.map((result, index) => (
                            <li key={index} className="result-item">
                                <div className="result-details">
                                    <strong className="model-name">Model:</strong>
                                    <span className="model-value">{result.model}</span>
                                </div>
                                <div className="result-details">
                                    <strong className="output-name">Output:</strong>
                                    <span className="output-value">{result.output}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>}

            <div className="chart-section">
                {isChartVisible && Object.keys(graphData).length > 0 && (
                    <ChartComponent2 chartData={graphData} />
                )}
            </div>
        </div>
    );
};

export default Dashboard2;
