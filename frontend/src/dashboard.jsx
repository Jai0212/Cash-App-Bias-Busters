import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import ChartComponent from "./ChartComponent";
import ControlButtons from "./ControlButtons";
import swal from "sweetalert2"; // Make sure to import SweetAlert2

const Dashboard = ({ VITE_BACKEND_URL }) => {
  const [data, setData] = useState([]);
  const [error, setError] = useState("");
  const [timeframe, setTimeframe] = useState("1 Day");
  const [demographics, setDemographics] = useState([]);
  const [selectedDemographic, setSelectedDemographic] = useState("");
  const [demographicValues, setDemographicValues] = useState([]);
  const [selectedValues, setSelectedValues] = useState({
    value1: "",
    value2: "",
    value3: "",
    value4: "",
  });
  const [headers, setHeaders] = useState([]); // State to hold headers
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

    const fetchEmailAndDemographics = async () => {
      const url = "http://localhost:11395/api/get-email"; // Your email fetching URL
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

        if (emailData.error) {
          swal.fire({
            icon: "error",
            title: emailData.message,
          });
        } else {
          const email = emailData.email;

          const demographicsResponse = await axios.get("http://127.0.0.1:5000/api/headers", {
            params: { email },
          });
          setDemographics(demographicsResponse.data);
        }
      } catch (err) {
        console.error("Error fetching email or demographics:", err);
        setError("Error fetching demographics");
      }
    };

    const fetchHeaders = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/api/headers", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ curr_user: currUser }),
        });

        // Check for an error in the response
        if (response.data.error) {
          setError(response.data.error);
          setHeaders([]); // Clear headers on error
        } else {
          setHeaders(response.data); // Assuming the response is an array of headers
          setError('');
        }
      } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
        setError('An error occurred while fetching headers.');
      }
    };

    fetchData();
    fetchEmailAndDemographics();
    fetchHeaders(); // Call fetchHeaders here
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
    setDemographicValues(["Value1", "Value2", "Value3", "Value4"]); // Placeholder values
  };

  const handleGenerate = () => {
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
    setSelectedValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
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
          <button onClick={() => handleTimeframeChange("1 Month")}>1 Month</button>
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
                {["value1", "value2", "value3", "value4"].map((valueKey) => (
                    <select
                        key={valueKey}
                        name={valueKey}
                        onChange={handleValueChange}
                        value={selectedValues[valueKey]}
                    >
                      <option value="">Select</option>
                      {demographicValues.map((val, index) => (
                          <option key={index} value={val}>
                            {val}
                          </option>
                      ))}
                    </select>
                ))}
              </div>
          )}
          <button onClick={handleGenerate}>Generate</button>
        </div>
        <ChartComponent ref={chartRef} data={dataForChart[timeframe]} />
        <ControlButtons onDownload={handleDownload} />
      </div>
  );
};

export default Dashboard;
