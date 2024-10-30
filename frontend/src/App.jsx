import React, { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";
import ChartComponent from "./ChartComponent";

const App = () => {
  const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  // const BACKEND_URL = 'http://127.0.0.1:5000'; // Adjust port if needed
  const [data, setData] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${VITE_BACKEND_URL}/get-data`); // Adjust port if needed
        setData(response.data);
      } catch (err) {
        setError("Error fetching data");
        console.error(err);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h1>Data from Database</h1>
      {error && <p>{error}</p>}
      <ul>
        {data.map((item, index) => (
          <li key={index}>{item.name}</li>
        ))}
      </ul>
      <ChartComponent />
    </div>
  );
};

export default App;
