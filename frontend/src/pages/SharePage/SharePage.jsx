import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from 'axios'; // Make sure to import axios if you're using it
import './SharePage.css'; // Make sure to import the CSS file for styling
import ChartComponent from "../DashboardPage/ChartComponenet/ChartComponent.jsx";
import graphDataDefault from '../DashboardPage/data/graphDataDefault.js'; // Import the default graph data

const SharePage = () => {
    const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
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
                    setData(data);
                    setLoading(false);
                    handleGenerate(data);
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

    const handleGenerate = (dataParam) => {
        if (
            !dataParam.currUser ||
            !dataParam.timeframe ||
            !dataParam.selectedDemographic ||
            !dataParam.selectedValues
        ) {
            console.warn(
                "currUser or selectedDemographic is missing. Cannot generate data."
            );
            return;
        }

        if (!dataParam.selectedDemographic || dataParam.selectedValues[0] === "") {
            alert("Upload data and model and select a demographic and values to generate data.");
            return;
        }

        const fetchData = async (retries = 5, delay = 1000) => {
            try {
                const response = await axios.post(`${VITE_BACKEND_URL}/api/generate`, {
                    demographics: [dataParam.selectedDemographic, dataParam.secondSelectedDemographic],
                    choices: {
                        [dataParam.selectedDemographic]: dataParam.selectedValues,
                        [dataParam.secondSelectedDemographic]: dataParam.selectedSecondValues,
                    },
                    curr_user: dataParam.currUser,
                    time: dataParam.timeframe,
                });

                if (response.data.length === 0) {
                    alert("No data found for the selected demographics and values. Choose a different combination.");
                    return;
                }
                setGraphData(response.data); // Set the graph data from the response
                calculateAverageBias(response.data); // Calculate the average bias
            } catch (err) {
                console.error("Error generating data:", err);
                // Retry logic: only retry if there are remaining attempts
                if (retries > 0) {
                    console.log(`Retrying... Attempts left: ${retries}`);
                    setTimeout(() => fetchData(retries - 1, delay * 2), delay); // Exponential backoff
                }
            }
        };

        fetchData(); // Start the fetch process
    };

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
