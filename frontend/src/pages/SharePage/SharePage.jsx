import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import './SharePage.css'; // Make sure to import the CSS file for styling
import ChartComponent from "../DashboardPage/ChartComponenet/ChartComponent.jsx";
import graphDataDefault from '../DashboardPage/data/graphDataDefault.js'; // Import the default graph data
import { envConfig } from "../../envConfig";

const SharePage = () => {
    const VITE_BACKEND_URL = envConfig();
    const { encodedData } = useParams(); // Access the encodedData parameter from the URL
    const chartRef = useRef(null);

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [averageBias, setAverageBias] = useState(null);
    const [graphData, setGraphData] = useState(graphDataDefault);

    useEffect(() => {
        if (encodedData) {
            setLoading(true);
            fetch(`${VITE_BACKEND_URL}/share/${encodedData}`, {
                method: "GET",
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Failed to fetch data");
                    }
                    return response.json();
                })
                .then((data) => {

                    if (!data.other_data || !data.graph_data) {
                        throw new Error("Invalid data format");
                    }
                    if (!data.other_data.currUser || !data.other_data.timeframe || !data.other_data.selectedDemographic || !data.other_data.selectedValues || data.other_data.selectedValues[0] === "") {
                        throw new Error("Missing required data fields");
                    }
                    setData(data.other_data);
                    setLoading(false);

                    if (data.graph_data.length === 0) {
                        alert("No data found for the selected demographics and values. Choose a different combination.");
                        return;
                    }

                    setGraphData(data.graph_data);
                    calculateAverageBias(data.graph_data);
                })
                .catch((error) => {
                    setError(error.message);
                    setLoading(false);
                });
        } else {
            setError("No encoded data found in URL.");
            setLoading(false);
        }
    }, [encodedData]);

    const calculateAverageBias = (data) => {
        if (!Array.isArray(data) || data.length === 0) {
            throw new Error("Invalid data: Input must be a non-empty array.");
        }

        // Sum all the accuracy values
        const totalAccuracy = data.reduce((sum, item) => sum + item.accuracy, 0);

        // Calculate the average
        const averageAccuracy = totalAccuracy / data.length;

        setAverageBias(parseFloat(averageAccuracy.toFixed(2)));
    };

    const maxValue = () => {
        let maxInitialElement = -Infinity;

        for (const key in graphData) {
            const initialElement = graphData[key][0];
            if (initialElement > maxInitialElement) {
                maxInitialElement = initialElement;
            }
        }
        return maxInitialElement;
    };

    return (
        <div className="share-page-container">
            {loading ? (
                <p className="loading-text">Loading...</p>
            ) : error ? (
                <p className="error-message">{error}</p>
            ) : (
                <div className="share-page-content">
                    <h1 className="page-title">
                        Data by {data.currUser.split('@')[0]} ({data.timeframe.charAt(0).toUpperCase() + data.timeframe.slice(1)})
                    </h1>

                    <div className="center-wrapper">
                        <div
                            className="overall-bias"
                            style={{
                                backgroundColor: averageBias > 0.5 ? '#ff6666' : '#66ff66', // Change background color
                            }}
                        >
                            Overall Bias: {averageBias}
                        </div>
                    </div>

                    <div className="graph-container">
                        <div className="graph-section">
                            {graphData && Object.keys(graphData).length > 0 && (
                                <ChartComponent
                                    ref={chartRef}
                                    chartData={graphData}
                                    sliderValue={0.5}
                                    bias={maxValue()}
                                />
                            )}
                        </div>
                    </div>

                    <div className="data-container">
                        <div className="demographics-container">
                            <div className="demographic-item">
                                <strong className="demographic-title">Demographic 1:</strong>
                                <span className="demographic-value">
                                    {data.selectedDemographic.charAt(0).toUpperCase() + data.selectedDemographic.slice(1)}
                                </span>
                                <ul className="demographics-list">
                                    {data.selectedValues &&
                                        data.selectedValues.map((value, index) => (
                                            <li key={index}>{value}</li>
                                        ))}
                                </ul>
                            </div>
                            <div className="demographic-item">
                                <strong className="demographic-title">Demographic 2:</strong>
                                <span className="demographic-value">
                                    {data.secondSelectedDemographic.charAt(0).toUpperCase() + data.secondSelectedDemographic.slice(1)}
                                </span>
                                <ul className="demographics-list">
                                    {data.selectedSecondValues &&
                                        data.selectedSecondValues.map((value, index) => (
                                            <li key={index}>{value}</li>
                                        ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

};

export default SharePage;
