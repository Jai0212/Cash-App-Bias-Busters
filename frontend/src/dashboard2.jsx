import React, { useState, useEffect, useRef } from "react";
import ChartComponent2 from "./ChartComponent2.jsx";
import ControlButton2 from "./ControlButtons2";
import "./Dashboard.css";

const Dashboard2 = () => {
    const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

    const [graphData, setGraphData] = useState({});
    const [currUser, setCurrUser] = useState(""); // Initialize currUser as an empty string
    const [isChartVisible, setIsChartVisible] = useState(true); // Set to true to show the chart immediately
    const chartRef = useRef(null);

    // Fetch email for the current user
    const fetchEmail = async () => {
        const url = "http://localhost:11355/api/get-email"; // URL for fetching email
        const token = localStorage.getItem("token"); // Get token from local storage

        try {
            const emailResponse = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`, // Pass token in Authorization header
                },
            });

            const emailData = await emailResponse.json();
            console.log(emailData);

            setCurrUser(emailData.email || ""); // Set email in currUser state
        } catch (error) {
            console.error("Error fetching email:", error);
        }
    };

    useEffect(() => {
        fetchEmail(); // Call the function to fetch email
    }, []);

    useEffect(() => {
        // Simulate the graph data here directly
        setGraphData({
            labels: ["Category 1", "Category 2", "Category 3"],
            datasets: [
                {
                    label: "Generated Data",
                    data: [30, 50, 70], // Hardcoded data points for the chart
                    backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
                },
            ],
        });
    }, []); // Set graph data when the component mounts

    return (
        <div className="dashboard-container">
            {/* Control button for uploading models */}
            <ControlButton2 onModelUpload={null} /> {/* No model upload handler here */}

            {/* Display the chart component immediately without waiting for a model upload */}
            {isChartVisible && Object.keys(graphData).length > 0 && (
                <ChartComponent2 chartData={graphData} />
            )}
        </div>
    );
};

export default Dashboard2;
