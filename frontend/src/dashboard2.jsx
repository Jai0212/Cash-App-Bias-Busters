import React, { useState, useEffect, useRef } from "react";
import ChartComponent2 from "./ChartComponent2.jsx";
import ControlButton2 from "./ControlButtons2";
import UserNavbar from "./Components/UserNavbar";
import "./Dashboard2.css";
import swal from 'sweetalert2';

const Dashboard2 = () => {
  const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const [currUser, setCurrUser] = useState("");
  const [graphData, setGraphData] = useState({});
  const [isChartVisible, setIsChartVisible] = useState(true);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [generationResults, setGenerationResults] = useState([]);

  const chartRef = useRef(null);

  const fetchEmailAndDemographics = async () => {
    const url = "http://127.0.0.1:5000/get-email"; // Your email fetching URL

    try {
      const emailResponse = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const emailData = await emailResponse.json();
      console.log(emailData);

      if (emailData && emailData.email) {
        setCurrUser(emailData.email); // Set the user email if it exists
      } else {
        setCurrUser("");

        swal.fire({
          icon: "error",
          title: "Please log in first",
          text: "You need to log in to access this page.",
          confirmButtonText: "Go to Login",
          timer: 5000,
          timerProgressBar: true,
        }).then(() => {

          window.location.href = "/";
        });
      }
    } catch (error) {
      console.error("Error fetching email:", error);

      // If there is any error fetching email, show the same alert
      swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred while fetching your email. Please try again later.",
      });
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
      const response = await fetch(
        `${VITE_BACKEND_URL}/api/generate-for-all-models`,
        {
          method: "POST",
          body: new URLSearchParams({
            curr_user: currUser,
          }),
        }
      );

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
      <div className="button-container">
        <ControlButton2 setUploadedFiles={setUploadedFiles} />

        <div className="action-button-container">
          <button onClick={handleGenerateClick} className="generate-btn">
            Generate
          </button>
        </div>
      </div>

      {generationResults.length > 0 && (
        <div className="result-section">
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
        </div>
      )}

      <div className="chart-section">
        {isChartVisible && Object.keys(graphData).length > 0 && (
          <ChartComponent2 chartData={graphData} />
        )}
      </div>
    </div>
  );
};

export default Dashboard2;
