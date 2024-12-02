import React, { useState, useEffect } from "react";
import ChartComponent2 from "../ChartComponenet2/ChartComponent2.jsx";
import ControlButton2 from "../ControlButtons2/ControlButtons2.jsx";
import "./Dashboard2.css";
import swal from "sweetalert2";
import { envConfig } from "../../../envConfig.js";

const Dashboard2 = () => {
  const VITE_BACKEND_URL = envConfig;

  const [currUser, setCurrUser] = useState("");
  const backgroundColours = [
    "#008585", // Bright yellow
    "#c7522a", // Light yellow
    "#893f71", // Lemon yellow
    "#ffa600", // Golden yellow
  ];

  const [graphData, setGraphData] = useState({
    labels: ["Model 1", "Model 2", "Model 3", "Model 4"],
    datasets: [
      {
        label: "Bias",
        data: [0, 0, 0, 0],
        backgroundColor: backgroundColours,
      },
    ],
  });

  const [uploadedFiles, setUploadedFiles] = useState([]);

  const [generationResults, setGenerationResults] = useState([]);

  useEffect(() => {
    const fetchEmailAndDemographics = async () => {
      const url = `${VITE_BACKEND_URL}/get-email`;

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

          swal
            .fire({
              icon: "error",
              title: "Please log in first",
              text: "You need to log in to access this page.",
              confirmButtonText: "Go to Login",
              timer: 5000,
              timerProgressBar: true,
            })
            .then(() => {
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

    fetchEmailAndDemographics();

    // Load uploaded files from localStorage
    const storedFiles = JSON.parse(localStorage.getItem("uploadedFiles"));
    if (storedFiles) {
      setUploadedFiles(storedFiles); // Update the state with uploaded files
    }
  }, []); // Runs once on component mount

  useEffect(() => {
    // Trigger handleGenerateClick only after currUser is initialized and there are uploaded files
    if (currUser && uploadedFiles.length > 0) {
      handleGenerateClick(); // Generate results for the uploaded files
    }
  }, [currUser, uploadedFiles]); // Runs whenever currUser or uploadedFiles changes

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

      const validResults = data.filter(
        (item) => !(item.error || (item.includes && item.includes("Error:")))
      );

      setGenerationResults(validResults);

      console.log("Model Tester Generation Results:", validResults);

      const meanData = validResults.map((result) => 1 - result.mean);

      setGraphData({
        labels: uploadedFiles,
        datasets: [
          {
            label: "Bias",
            data: meanData,
            backgroundColor: backgroundColours,
          },
        ],
      });
    } catch (error) {
      console.error("Error during model generation:", error);
      alert("Error during model generation: " + error.message);
    }
  };

  return (
    <>
      {uploadedFiles.length > 0 ? (
        <div className="dashboard-main">
          <div className="left-container">
            <div className="chart-section">
              {Object.keys(graphData).length > 0 && (
                <ChartComponent2
                  chartData={graphData}
                  generationalResults={generationResults}
                />
              )}

              {generationResults.length > 0 && (
                <div className="result-section">
                  {generationResults.map(
                    (result, index) =>
                      uploadedFiles[index] &&
                      result.mean && (
                        <ul key={index}>
                          <li className="result-item">
                            <div
                              className="result-tag"
                              style={{
                                backgroundColor:
                                  backgroundColours[
                                    index % backgroundColours.length
                                  ],
                              }}
                            ></div>
                            <div className="result-details">
                              <strong className="output-name">File:</strong>
                              <span className="output-value">
                                {uploadedFiles[index]}
                              </span>
                            </div>
                            <div className="result-details">
                              <strong className="output-name">Race:</strong>
                              <span className="output-value">
                                {result.race}
                              </span>
                            </div>
                            <div className="result-details">
                              <strong className="output-name">Gender:</strong>
                              <span className="output-value">
                                {result.gender}
                              </span>
                            </div>
                            <div className="result-details">
                              <strong className="output-name">Age:</strong>
                              <span className="output-value">
                                {result.age_groups}
                              </span>
                            </div>
                            <div className="result-details">
                              <strong className="output-name">State:</strong>
                              <span className="output-value">
                                {result.state}
                              </span>
                            </div>
                            <div className="result-details">
                              <strong className="output-name">Bias:</strong>
                              <span className="output-value">
                                {1 - result.mean}
                              </span>
                            </div>
                          </li>
                        </ul>
                      )
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="right-container">
            {/* Pass setUploadedFiles to ControlButton2 */}
            <div className="button-container">
              <ControlButton2 setUploadedFiles={setUploadedFiles} />
            </div>
          </div>
        </div>
      ) : (
        <div className="pre-upload-dashboard">
          <div className="button-container-pre">
            <ControlButton2 setUploadedFiles={setUploadedFiles} />

            {uploadedFiles.length > 0 && (
              <div className="action-button-container">
                <button onClick={handleGenerateClick} className="generate-btn">
                  Generate
                </button>
              </div>
            )}
          </div>
          <img
            src="/bg-bottom-left-desktop.webp"
            alt="Cashapp illustration"
            className="illustration"
          />
          <img
            src="/bg-bottom-right-desktop.webp"
            alt="Cashapp illustration"
            className="illustration3"
          />
          <img
            src="/bg-top-right-desktop.webp"
            alt="Cashapp illustration"
            className="illustration2"
          />
          <img
            src="/star.png"
            alt="Cashapp illustration"
            className="illustration4"
          />
          <img
            src="/flower.png"
            alt="Cashapp illustration"
            className="illustration5"
          />
          <img
            src="/star2.png"
            alt="Cashapp illustration"
            className="illustration6"
          />
          <img
            src="/bg-bottom-left-desktop copy.webp"
            alt="Cashapp illustration"
            className="illustration7"
          />
        </div>
      )}
    </>
  );
};

export default Dashboard2;
