import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import ChartComponent from "./ChartComponent";
import ControlButtons from "./ControlButtons";
import { set } from "react-hook-form";
import "./Dashboard.css"
// ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);


const Dashboard = () => {
  const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const [currUser, setCurrUser] = useState(""); // Initialize currUser as an empty string

  // const curr_user = "test_table"; // Example user for fetching data

  const bias = 0.7;

  const [error, setError] = useState("");
  const [sliderValue, setSliderValue] = useState(0.5);

  const [timeframe, setTimeframe] = useState("year");

  const [demographics, setDemographics] = useState([]);

  const [selectedDemographic, setSelectedDemographic] = useState("");
  const [demographicValues, setDemographicValues] = useState([]);
  const [selectedValues, setSelectedValues] = useState(["", "", "", ""]);

  const [secondSelectedDemographic, setSecondSelectedDemographic] = useState("");
  const [secondDemographicValues, setSecondDemographicValues] = useState([]);
  const [selectedSecondValues, setSelectedSecondValues] = useState(["", "", "", ""]);

  const [hasFetchedInitialData, setHasFetchedInitialData] = useState(false);

  const chartRef = useRef(null);

  const fetchEmailAndDemographics = async () => {
    const url = "http://localhost:11355/api/get-email"; // Your email fetching URL
    const token = localStorage.getItem('token'); // Token from local storage

    try {
      const emailResponse = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token,
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

        const response = await axios.post(`${VITE_BACKEND_URL}/api/get-prev-data`, {
          curr_user: currUser,
        });

        if (response.data && response.data.demographics && response.data.choices && response.data.time) {

          console.log("Previous data:", response.data);

          if (response.data.demographics[0] != "") {
            setSelectedDemographic(response.data.demographics[0]);
            setSelectedValues(response.data.choices[response.data.demographics[0]]);
          }

          if (response.data.demographics[1] != "") {
            setSecondSelectedDemographic(response.data.demographics[1]);
            setSelectedSecondValues(response.data.choices[response.data.demographics[1]]);
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
    if (hasFetchedInitialData && selectedDemographic && selectedValues.length > 0 && timeframe) {
      console.log("Selected demographic:", selectedDemographic, "Selected values:", selectedValues);
      console.log("Second selected demographic:", secondSelectedDemographic, "Second selected values:", selectedSecondValues);
      handleGenerate();
    }
  }, [selectedDemographic, selectedValues, secondSelectedDemographic, selectedSecondValues, timeframe]);


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
          const response = await axios.post(`${VITE_BACKEND_URL}/api/values-under-header`, {
            curr_user: currUser,
            header: selectedDemographic,
          });
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
          const response = await axios.post(`${VITE_BACKEND_URL}/api/values-under-header`, {
            curr_user: currUser,
            header: secondSelectedDemographic,
          });
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
        choices: { [selectedDemographic]: selectedValues, [secondSelectedDemographic]: selectedSecondValues },
        curr_user: currUser,
        time: timeframe,
      })
      .then((response) => {
        console.log("Data generated:", response.data); // TODO Display data on chart
      })
      .catch((err) => {
        console.error("Error generating data:", err);
      });
  };

  const handleSliderChange = (event) => {
    setSliderValue(parseFloat(event.target.value));
    console.log("Slider Value:", event.target.value); // For debugging
  };


  const dataForChart = {
    "day": {
      labels: ["Hour 1", "Hour 2", "Hour 3"],
      datasets: [
        {
          label: "Random Data 1",
          data: [0.3, 0.4, 0.8],
          borderColor: "rgba(75, 192, 192, 1)",
        },
        {
          label: "Random Data 2",
          data: [0.6, 0.7, 0.4],
          borderColor: "rgba(255, 99, 132, 1)",
        },
      ],
    },
    "week": {
      labels: ["Day 1", "Day 2", "Day 3"],
      datasets: [
        {
          label: "Random Data 1",
          data: [0.3, 0.9, 0.4],
          borderColor: "rgba(75, 192, 192, 1)",
        },
        {
          label: "Random Data 2",
          data: [75, 125, 175],
          borderColor: "rgba(255, 99, 132, 1)",
        },
      ],
    },
    "month": {
      labels: ["Week 1", "Week 2", "Week 3"],
      datasets: [
        {
          label: "Random Data 1",
          data: [0.8, 0.6, 0.7],
          borderColor: "rgba(75, 192, 192, 1)",
        },
        {
          label: "Random Data 2",
          data: [0.3, 0.9, 0.4],
          borderColor: "rgba(255, 99, 132, 1)",
        },
      ],
    },
    "year": {
      labels: ["Jan", "Feb", "Mar"],
      datasets: [
        {
          label: "Random Data 1",
          data: [0.8, 0.6, 0.7],
          borderColor: "rgba(75, 192, 192, 1)",
        },
        {
          label: "Random Data 2",
          data: [0.3, 0.9, 0.4],
          borderColor: "rgba(255, 99, 132, 1)",
        },
      ],
    },
  };

  return (
    <div className="dashboard-container">
      <div className="timeframe-buttons">
        <button onClick={() => handleTimeframeChange("day")}>1 Day</button>
        <button onClick={() => handleTimeframeChange("week")}>1 Week</button>
        <button onClick={() => handleTimeframeChange("month")}>1 Month</button>
        <button onClick={() => handleTimeframeChange("year")}>1 Year</button>
      </div>

      <div className="slider-container">
        <label>Adjust the slider (0 to 1): {sliderValue}</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={sliderValue}
          onChange={handleSliderChange}
        />
      </div>

      <div className="select-container">
        <h2>Select First Demographic</h2>
        <select onChange={handleDemographicChange} value={selectedDemographic}>
          <option value="">Select</option>
          {demographics.map((demo, index) => (
            <option key={index} value={demo}>
              {demo}
            </option>
          ))}
        </select>

        {selectedDemographic && (
          <div>
            <h3>Select Values for First Demographic</h3>
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

        {selectedDemographic && (
          <>
            <h2>Select Second Demographic</h2>
            <select onChange={handleSecondDemographicChange} value={secondSelectedDemographic}>
              <option value="">Select</option>
              {demographics
                .filter((demo) => demo !== selectedDemographic)
                .map((demo, index) => (
                  <option key={index} value={demo}>
                    {demo}
                  </option>
                ))}
            </select>
          </>
        )}

        {secondSelectedDemographic && (
          <div>
            <h3>Select Values for Second Demographic</h3>
            {[...Array(4)].map((_, idx) => (
              <select
                key={idx}
                onChange={(event) => handleValueChange(event, idx, true)}
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

      <button className="generate-button" onClick={handleGenerate}>
        Generate
      </button>

      <ChartComponent ref={chartRef} data={dataForChart[timeframe]} sliderValue={sliderValue}  bias={bias}/>
      <ControlButtons onDownload={handleDownload} />
    </div>
  );
};

export default Dashboard;