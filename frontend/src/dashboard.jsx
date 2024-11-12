import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import ChartComponent from "./ChartComponent";
import ControlButtons from "./ControlButtons";
import { set } from "react-hook-form";
import "./Dashboard.css";

const Dashboard = () => {
  const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const [graphData, setGraphData] = useState({});

  const [currUser, setCurrUser] = useState(""); // Initialize currUser as an empty string

  // const curr_user = "test_table"; // Example user for fetching data

  const [error, setError] = useState("");
  const [sliderValue, setSliderValue] = useState(0.5);

  const [timeframe, setTimeframe] = useState("year");

  const [demographics, setDemographics] = useState([]);

  const [selectedDemographic, setSelectedDemographic] = useState("");
  const [demographicValues, setDemographicValues] = useState([]);
  const [selectedValues, setSelectedValues] = useState(["", "", "", ""]);

  const [secondSelectedDemographic, setSecondSelectedDemographic] =
    useState("");
  const [secondDemographicValues, setSecondDemographicValues] = useState([]);
  const [selectedSecondValues, setSelectedSecondValues] = useState([
    "",
    "",
    "",
    "",
  ]);

  const [hasFetchedInitialData, setHasFetchedInitialData] = useState(false);

  const chartRef = useRef(null);

  const fetchEmailAndDemographics = async () => {
    const url = "http://localhost:11355/api/get-email"; // Your email fetching URL
    const token = localStorage.getItem("token"); // Token from local storage

    try {
      const emailResponse = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      });

      const emailData = await emailResponse.json();
      console.log(emailData);

      setCurrUser(emailData.email || "");
    } catch (error) {
      console.error("Error fetching email:", error);
    }
  };

  useEffect(() => {
    fetchEmailAndDemographics();
  }, []);

  useEffect(() => {
    const fethPrevData = async () => {
      try {
        if (!currUser) return;

        const response = await axios.post(
          `${VITE_BACKEND_URL}/api/get-prev-data`,
          {
            curr_user: currUser,
          }
        );

        if (
          response.data &&
          response.data.demographics &&
          response.data.choices &&
          response.data.time
        ) {
          console.log("Previous data:", response.data);

          if (response.data.demographics[0] != "") {
            setSelectedDemographic(response.data.demographics[0]);
            setSelectedValues(
              response.data.choices[response.data.demographics[0]]
            );
          }

          if (response.data.demographics[1] != "") {
            setSecondSelectedDemographic(response.data.demographics[1]);
            setSelectedSecondValues(
              response.data.choices[response.data.demographics[1]]
            );
          }

          setTimeframe(response.data.time);
        }
      } catch (error) {
        console.error("Error fetching previous data:", error);
      } finally {
        setHasFetchedInitialData(true);
      }
    };

    fethPrevData();
  }, [currUser, VITE_BACKEND_URL]);

  useEffect(() => {
    if (
      hasFetchedInitialData &&
      selectedDemographic &&
      selectedValues.length > 0 &&
      timeframe
    ) {
      console.log(
        "Selected demographic:",
        selectedDemographic,
        "Selected values:",
        selectedValues
      );
      console.log(
        "Second selected demographic:",
        secondSelectedDemographic,
        "Second selected values:",
        selectedSecondValues
      );
      handleGenerate();
    }
  }, [
    selectedDemographic,
    selectedValues,
    secondSelectedDemographic,
    selectedSecondValues,
    timeframe,
  ]);

  useEffect(() => {
    const fetchDemographics = async () => {
      try {
        const response = await axios.post(`${VITE_BACKEND_URL}/api/headers`, {
          curr_user: currUser,
        });
        if (response.data.error) {
          setError(response.data.error);
        } else {
          setDemographics(response.data);
        }
      } catch (err) {
        setError("Error fetching demographics");
        console.error(err);
      }
    };

    fetchDemographics();
  }, [currUser, hasFetchedInitialData]);

  useEffect(() => {
    if (selectedDemographic) {
      const fetchValues = async () => {
        try {
          const response = await axios.post(
            `${VITE_BACKEND_URL}/api/values-under-header`,
            {
              curr_user: currUser,
              header: selectedDemographic,
            }
          );
          if (response.data.error) {
            setError(response.data.error);
          } else {
            setDemographicValues(response.data);
          }
        } catch (err) {
          setError("Error fetching values");
          console.error(err);
        }
      };
      fetchValues();
    }
  }, [currUser, selectedDemographic, hasFetchedInitialData]);

  useEffect(() => {
    if (secondSelectedDemographic) {
      const fetchSecondValues = async () => {
        try {
          const response = await axios.post(
            `${VITE_BACKEND_URL}/api/values-under-header`,
            {
              curr_user: currUser,
              header: secondSelectedDemographic,
            }
          );
          if (response.data.error) {
            setError(response.data.error);
          } else {
            setSecondDemographicValues(response.data);
          }
        } catch (err) {
          setError("Error fetching second demographic values");
          console.error(err);
        }
      };
      fetchSecondValues();
    }
  }, [currUser, secondSelectedDemographic, hasFetchedInitialData]);

  const handleDemographicChange = (event) => {
    setSelectedDemographic(event.target.value);
    setSelectedValues(["", "", "", ""]); // Reset values when demographic changes
  };

  const handleSecondDemographicChange = (event) => {
    setSecondSelectedDemographic(event.target.value);
    setSelectedSecondValues(["", "", "", ""]); // Reset values when demographic changes
  };

  const handleValueChange = (event, index, isSecond = false) => {
    if (isSecond) {
      const newValues = [...selectedSecondValues];
      newValues[index] = event.target.value;
      setSelectedSecondValues(newValues);
    } else {
      const newValues = [...selectedValues];
      newValues[index] = event.target.value;
      setSelectedValues(newValues);
    }
  };

  const handleTimeframeChange = (newTimeframe) => {
    setTimeframe(newTimeframe.toLowerCase());
  };

  const handleDownload = () => {
    if (chartRef.current) {
      chartRef.current.downloadChart();
    }
  };

  const handleGenerate = () => {
    axios
      .post(`${VITE_BACKEND_URL}/api/generate`, {
        demographics: [selectedDemographic, secondSelectedDemographic],
        choices: {
          [selectedDemographic]: selectedValues,
          [secondSelectedDemographic]: selectedSecondValues,
        },
        curr_user: currUser,
        time: timeframe,
      })
      .then((response) => {
        console.log("Data generated:", response.data); // TODO Display data on chart
        setGraphData(response.data);
      })
      .catch((err) => {
        console.error("Error generating data:", err);
      });
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

  const handleSliderChange = (event) => {
    setSliderValue(parseFloat(event.target.value));
    console.log("Slider Value:", event.target.value); // For debugging
  };

  // Check if graphData is empty and set all y values to 0 if true
  const modifiedGraphData =
    Object.keys(graphData).length === 0
      ? {
          labels: ["Default Label 1", "Default Label 2", "Default Label 3"], // Default labels
          datasets: [
            {
              label: "Default Data",
              data: [0, 0, 0], // Default y values set to 0
              borderColor: "rgba(75, 192, 192, 1)",
            },
          ],
        }
      : graphData;

  useEffect(() => {
    setGraphData([
      {
        feature1: "Black",
        feature2: "Female",
        accuracy: 0.25,
        falsepositive: 0.75,
        falsenegative: 0.0,
        combination_label: "Black Female",
      },
      {
        feature1: "Black",
        feature2: "Male",
        accuracy: 0.2,
        falsepositive: 0.0,
        falsenegative: 1.0,
        combination_label: "Black Male",
      },
      {
        feature1: "Black",
        feature2: "Non-binary",
        accuracy: 0.5,
        falsepositive: 0.0,
        falsenegative: 0.5,
        combination_label: "Black Non-binary",
      },
      {
        feature1: "Hispanic",
        feature2: "Female",
        accuracy: 0.33,
        falsepositive: 0.67,
        falsenegative: 0.0,
        combination_label: "Hispanic Female",
      },
      {
        feature1: "Hispanic",
        feature2: "Male",
        accuracy: 0.5,
        falsepositive: 0.0,
        falsenegative: 0.5,
        combination_label: "Hispanic Male",
      },
      {
        feature1: "Hispanic",
        feature2: "Non-binary",
        accuracy: 1.0,
        falsepositive: 0.0,
        falsenegative: 0.0,
        combination_label: "Hispanic Non-binary",
      },
      {
        feature1: "Other",
        feature2: "Female",
        accuracy: 0.67,
        falsepositive: 0.0,
        falsenegative: 0.33,
        combination_label: "Other Female",
      },
      {
        feature1: "Other",
        feature2: "Male",
        accuracy: 0.75,
        falsepositive: 0.25,
        falsenegative: 0.0,
        combination_label: "Other Male",
      },
      {
        feature1: "Other",
        feature2: "Non-binary",
        accuracy: 0.7,
        falsepositive: 0.0,
        falsenegative: 1.0,
        combination_label: "Other Non-binary",
      },
      {
        feature1: "Black",
        feature2: "Other",
        accuracy: 0.56,
        falsepositive: 0.0,
        falsenegative: 1.0,
        combination_label: "Black Other",
      },
      {
        feature1: "Hispanic",
        feature2: "Other",
        accuracy: 0.42,
        falsepositive: 0.0,
        falsenegative: 1.0,
        combination_label: "Hispanic Other",
      },
      {
        feature1: "White",
        feature2: "Male",
        accuracy: 0.2,
        falsepositive: 0.25,
        falsenegative: 0.0,
        combination_label: "Wite Male",
      },
      {
        feature1: "White",
        feature2: "Non-binary",
        accuracy: 0.5,
        falsepositive: 0.0,
        falsenegative: 1.0,
        combination_label: "White Non-binary",
      },
      {
        feature1: "White",
        feature2: "Other",
        accuracy: 0.64,
        falsepositive: 0.0,
        falsenegative: 1.0,
        combination_label: "White Other",
      },
    ]);
  }, []);

  useEffect(() => {
    console.log("Graph data updated:", graphData);
  }, [graphData]);

  return (
    <div className="dashboard-container">
      <div className="slider-container">
        <label className="slider-label">
          Adjust the slider (0 to 1): {sliderValue}
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={sliderValue}
          onChange={handleSliderChange}
        />
      </div>

      <div className="chart-container-container">
        <div className="timeframe-buttons">
          <button
            className={timeframe === "day" ? "active-button" : ""}
            onClick={() => handleTimeframeChange("day")}
          >
            1 Day
          </button>
          <button
            className={timeframe === "week" ? "active-button" : ""}
            onClick={() => handleTimeframeChange("week")}
          >
            1 Week
          </button>
          <button
            className={timeframe === "month" ? "active-button" : ""}
            onClick={() => handleTimeframeChange("month")}
          >
            1 Month
          </button>
          <button
            className={timeframe === "year" ? "active-button" : ""}
            onClick={() => handleTimeframeChange("year")}
          >
            1 Year
          </button>
        </div>

        {Object.keys(graphData).length > 0 && (
          <ChartComponent
            ref={chartRef}
            chartData={graphData}
            sliderValue={sliderValue}
            bias={maxValue()}
          />
        )}

        <div className="select-demographics-2">
          <div className="demog-clas">
            <h2>Demographics</h2>
          </div>
          <div className="select-demographics">
            <div className="title"></div>
            <div className="select-container">
              <select
                onChange={handleDemographicChange}
                value={selectedDemographic}
              >
                <option value="">Select</option>
                {demographics.map((demo, index) => (
                  <option key={index} value={demo}>
                    {demo}
                  </option>
                ))}
              </select>

              {selectedDemographic && (
                <div>
                  <h3>Values for First Demographic</h3>
                  {[...Array(4)].map((_, idx) => (
                    <select
                      key={idx}
                      onChange={(event) => handleValueChange(event, idx)}
                      value={selectedValues[idx] || ""}
                    >
                      <option value="">Select</option>
                      {demographicValues
                        .filter((val) => !selectedSecondValues.includes(val))
                        .map((val, index) => (
                          <option key={index} value={val}>
                            {val}
                          </option>
                        ))}
                    </select>
                  ))}
                </div>
              )}
            </div>

            {selectedDemographic && (
              <div className="select-container">
                <select
                  onChange={handleSecondDemographicChange}
                  value={secondSelectedDemographic}
                >
                  <option classNamevalue="dropdown">Select</option>
                  {demographics
                    .filter((demo) => demo !== selectedDemographic)
                    .map((demo, index) => (
                      <option key={index} value={demo}>
                        {demo}
                      </option>
                    ))}
                </select>

                {secondSelectedDemographic && selectedDemographic && (
                  <div>
                    <h3>Values for Second Demographic</h3>
                    {[...Array(4)].map((_, idx) => (
                      <select
                        key={idx}
                        onChange={(event) =>
                          handleValueChange(event, idx, true)
                        }
                        value={selectedSecondValues[idx] || ""}
                      >
                        <option value="">Select</option>
                        {secondDemographicValues
                          .filter((val) => !selectedValues.includes(val))
                          .map((val, index) => (
                            <option key={index} value={val}>
                              {val}
                            </option>
                          ))}
                      </select>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="generate-btn-container">
            <button className="generate-button" onClick={handleGenerate}>
              Generate
            </button>
          </div>
        </div>
      </div>

      <ControlButtons onDownload={handleDownload} />
    </div>
  );
};

export default Dashboard;
