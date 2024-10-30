// src/App.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";
import ChartComponent from "./ChartComponent";

const App = () => {
  const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const [data, setData] = useState([]);
  const [error, setError] = useState("");
  const [timeframe, setTimeframe] = useState("1 Day"); // Initialize timeframe state

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
    // Update the data based on the new timeframe here if needed
  };

  // Sample data for different timeframes
  const dataForChart = {
    "1 Day": {
      labels: ["Hour 1", "Hour 2", "Hour 3", "Hour 4", "Hour 5", "Hour 6"],
      datasets: [
        {
          label: "Random Data 1",
          data: [10, 20, 30, 40, 50, 60],
          borderColor: "rgba(75, 192, 192, 1)",
        },
        {
          label: "Random Data 2",
          data: [15, 25, 35, 45, 55, 65],
          borderColor: "rgba(255, 99, 132, 1)",
        },
      ],
    },
    "1 Month": {
      labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
      datasets: [
        {
          label: "Random Data 1",
          data: [100, 200, 300, 400],
          borderColor: "rgba(75, 192, 192, 1)",
        },
        {
          label: "Random Data 2",
          data: [150, 250, 350, 450],
          borderColor: "rgba(255, 99, 132, 1)",
        },
      ],
    },
    "1 Year": {
      labels: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      datasets: [
        {
          label: "Random Data 1",
          data: [110, 210, 310, 410, 510, 610, 710, 810, 910, 1010, 1110, 1210],
          borderColor: "rgba(75, 192, 192, 1)",
        },
        {
          label: "Random Data 2",
          data: [115, 215, 315, 415, 515, 615, 150, 815, 915, 1015, 1115, 1215],
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
        <button onClick={() => handleTimeframeChange("1 Month")}>1 Week</button>
        <button onClick={() => handleTimeframeChange("1 Year")}>1 Year</button>
      </div>
      <ChartComponent data={dataForChart[timeframe]} />
    </div>
  );
};

export default App;
