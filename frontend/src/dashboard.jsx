// src/Dashboard.jsx
import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import ChartComponent from "./ChartComponent";
import ControlButtons from "./ControlButtons";

const Dashboard = ({ VITE_BACKEND_URL }) => {
  const [data, setData] = useState([]);
  const [error, setError] = useState("");
  const [timeframe, setTimeframe] = useState("1 Day");
  const [demographics, setDemographics] = useState([
    "Gender",
    "Race",
    "Age",
    "Income",
  ]); // Placeholder list
  const [selectedDemographic, setSelectedDemographic] = useState("");

  const [selectedDemographic2, setSelectedDemographic2] = useState("");

  const [demographicValues, setDemographicValues] = useState([]);
  const [selectedValues, setSelectedValues] = useState({
    value1: "",
    value2: "",
    value3: "",
    value4: "",
  });
  const chartRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${VITE_BACKEND_URL}/get-data`);
        setData(response.data);
      } catch (err) {
        setError("Error fetching data");
        console.error(err);
      }
    };
    fetchData();
  }, [VITE_BACKEND_URL]);

  const handleTimeframeChange = (newTimeframe) => {
    setTimeframe(newTimeframe);
  };

  const handleDownload = () => {
    if (chartRef.current) {
      chartRef.current.downloadChart();
    }
  };

  const handleDemographicChange = (event) => {
    const demographic = event.target.value;
    setSelectedDemographic(demographic);
    // Placeholder values, these should come from the backend based on selected demographic
    setDemographicValues(["Value1", "Value2", "Value3", "Value4"]);
  };

  const handleDemographicChange2 = (event) => {
    const demographic = event.target.value;
    setSelectedDemographic2(demographic);
    // Placeholder values, these should come from the backend based on selected demographic
    setDemographicValues(["Value1", "Value2", "Value3", "Value4"]);
  };

  const handleGenerate = () => {
    // Make API call with selected demographic and values
    console.log("Generate called with:", selectedDemographic, selectedValues);
    // Placeholder for actual API call
    axios
      .post(`${VITE_BACKEND_URL}/generate`, {
        demographic: selectedDemographic,
        values: selectedValues,
      })
      .then((response) => {
        console.log("Data generated:", response.data);
      })
      .catch((err) => {
        console.error("Error generating data:", err);
      });
  };

  const handleValueChange = (event) => {
    const { name, value } = event.target;
    setSelectedValues({
      ...selectedValues,
      [name]: value,
    });
  };

  const dataForChart = {
    "1 Day": {
      labels: ["Hour 1", "Hour 2", "Hour 3"],
      datasets: [
        {
          label: "Random Data 1",
          data: [10, 20, 30],
          borderColor: "rgba(75, 192, 192, 1)",
        },
        {
          label: "Random Data 2",
          data: [15, 25, 35],
          borderColor: "rgba(255, 99, 132, 1)",
        },
      ],
    },
    "1 Month": {
      labels: ["Week 1", "Week 2", "Week 3"],
      datasets: [
        {
          label: "Random Data 1",
          data: [100, 200, 300],
          borderColor: "rgba(75, 192, 192, 1)",
        },
        {
          label: "Random Data 2",
          data: [150, 250, 350],
          borderColor: "rgba(255, 99, 132, 1)",
        },
      ],
    },
    "1 Year": {
      labels: ["Jan", "Feb", "Mar"],
      datasets: [
        {
          label: "Random Data 1",
          data: [110, 210, 310],
          borderColor: "rgba(75, 192, 192, 1)",
        },
        {
          label: "Random Data 2",
          data: [115, 215, 315],
          borderColor: "rgba(255, 99, 132, 1)",
        },
      ],
    },
  };

  return (
    <div>
      <h1>Data from Database</h1>
      {error && <p>{error}</p>}
      <ul>
        {data.map((item, index) => (
          <li key={index}>{item.name}</li>
        ))}
      </ul>
      <div>
        <button onClick={() => handleTimeframeChange("1 Day")}>1 Day</button>
        <button onClick={() => handleTimeframeChange("1 Month")}>
          1 Month
        </button>
        <button onClick={() => handleTimeframeChange("1 Year")}>1 Year</button>
      </div>
      <div>
        <h2>Select Demographic</h2>
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
            <h3>Select Values</h3>
            <select
              name="value1"
              onChange={handleValueChange}
              value={selectedValues.value1}
            >
              <option value="">Select</option>
              {demographicValues.map((val, index) => (
                <option key={index} value={val}>
                  {val}
                </option>
              ))}
            </select>
            <select
              name="value2"
              onChange={handleValueChange}
              value={selectedValues.value2}
            >
              <option value="">Select</option>
              {demographicValues.map((val, index) => (
                <option key={index} value={val}>
                  {val}
                </option>
              ))}
            </select>
            <select
              name="value3"
              onChange={handleValueChange}
              value={selectedValues.value3}
            >
              <option value="">Select</option>
              {demographicValues.map((val, index) => (
                <option key={index} value={val}>
                  {val}
                </option>
              ))}
            </select>
            <select
              name="value4"
              onChange={handleValueChange}
              value={selectedValues.value4}
            >
              <option value="">Select</option>
              {demographicValues.map((val, index) => (
                <option key={index} value={val}>
                  {val}
                </option>
              ))}
            </select>
          </div>
        )}
        <button onClick={handleGenerate}>Generate</button>
      </div>
      <div>
        <h2>Select Demographic 2</h2>
        <select
          onChange={handleDemographicChange2}
          value={selectedDemographic2}
        >
          <option value="">Select</option>
          {demographics.map((demo, index) => (
            <option key={index} value={demo}>
              {demo}
            </option>
          ))}
        </select>
        {selectedDemographic2 && (
          <div>
            <h3>Select Values</h3>
            <select
              name="value1"
              onChange={handleValueChange}
              value={selectedValues.value1}
            >
              <option value="">Select</option>
              {demographicValues.map((val, index) => (
                <option key={index} value={val}>
                  {val}
                </option>
              ))}
            </select>
            <select
              name="value2"
              onChange={handleValueChange}
              value={selectedValues.value2}
            >
              <option value="">Select</option>
              {demographicValues.map((val, index) => (
                <option key={index} value={val}>
                  {val}
                </option>
              ))}
            </select>
            <select
              name="value3"
              onChange={handleValueChange}
              value={selectedValues.value3}
            >
              <option value="">Select</option>
              {demographicValues.map((val, index) => (
                <option key={index} value={val}>
                  {val}
                </option>
              ))}
            </select>
            <select
              name="value4"
              onChange={handleValueChange}
              value={selectedValues.value4}
            >
              <option value="">Select</option>
              {demographicValues.map((val, index) => (
                <option key={index} value={val}>
                  {val}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <ChartComponent ref={chartRef} data={dataForChart[timeframe]} />
      <ControlButtons onDownload={handleDownload} />
    </div>
  );
};

export default Dashboard;
