import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import ChartComponent from "../ChartComponenet/ChartComponent.jsx";
import ControlButtons from "../ControlButtons/ControlButtons.jsx";
import { set } from "react-hook-form";
import "./Dashboard.css";
import Modal from '../../../Components/Modal/Modal.jsx';
import axiosRetry from "axios-retry";
import swal from 'sweetalert2';
import TourGuide from '../TourGuide/TourGuide.jsx';
import Slider from '../Slider/Slider.jsx';


const Dashboard = () => {
  const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const [isModalOpen, setIsModalOpen] = useState(false); // State to control the modal

  const [graphData, setGraphData] = useState([
    {
      feature1: "Demographic 1",
      feature2: "Demographic 2",
      accuracy: 0,
      falsepositive: 0,
      falsenegative: 0,
      combination_label: "Demographic 1 Demographic 2",
    },
    {
      feature1: "Demographic 1",
      feature2: "Demographic 2",
      accuracy: 0,
      falsepositive: 0,
      falsenegative: 0,
      combination_label: "Demographic 1 Demographic 2",
    },
    {
      feature1: "Demographic 1",
      feature2: "Demographic 2",
      accuracy: 0,
      falsepositive: 0,
      falsenegative: 0,
      combination_label: "Demographic 1 Demographic 2",
    },
    {
      feature1: "Demographic 1",
      feature2: "Demographic 2",
      accuracy: 0,
      falsepositive: 0,
      falsenegative: 0,
      combination_label: "Demographic 1 Demographic 2",
    },
    {
      feature1: "Demographic 1",
      feature2: "Demographic 2",
      accuracy: 0,
      falsepositive: 0,
      falsenegative: 0,
      combination_label: "Demographic 1 Demographic 2",
    },
    {
      feature1: "Demographic 1",
      feature2: "Demographic 2",
      accuracy: 0,
      falsepositive: 0,
      falsenegative: 0,
      combination_label: "Demographic 1 Demographic 2",
    },
    {
      feature1: "Demographic 1",
      feature2: "Demographic 2",
      accuracy: 0,
      falsepositive: 0,
      falsenegative: 0,
      combination_label: "Demographic 1 Demographic 2",
    },
    {
      feature1: "Demographic 1",
      feature2: "Demographic 2",
      accuracy: 0,
      falsepositive: 0,
      falsenegative: 0,
      combination_label: "Demographic 1 Demographic 2",
    },
    {
      feature1: "Demographic 1",
      feature2: "Demographic 2",
      accuracy: 0,
      falsepositive: 0,
      falsenegative: 0,
      combination_label: "Demographic 1 Demographic 2",
    },
    {
      feature1: "Demographic 1",
      feature2: "Demographic 2",
      accuracy: 0,
      falsepositive: 0,
      falsenegative: 0,
      combination_label: "Demographic 1 Demographic 2",
    },
    {
      feature1: "Demographic 1",
      feature2: "Demographic 2",
      accuracy: 0,
      falsepositive: 0,
      falsenegative: 0,
      combination_label: "Demographic 1 Demographic 2",
    },
    {
      feature1: "Demographic 1",
      feature2: "Demographic 2",
      accuracy: 0,
      falsepositive: 0,
      falsenegative: 0,
      combination_label: "Demographic 1 Demographic 2",
    },
    {
      feature1: "Demographic 1",
      feature2: "Demographic 2",
      accuracy: 0,
      falsepositive: 0,
      falsenegative: 0,
      combination_label: "Demographic 1 Demographic 2",
    },
    {
      feature1: "Demographic 1",
      feature2: "Demographic 2",
      accuracy: 0,
      falsepositive: 0,
      falsenegative: 0,
      combination_label: "Demographic 1 Demographic 2",
    },
  ]);

  const [currUser, setCurrUser] = useState("");

  const [error, setError] = useState("");
  // const [sliderValue, setSliderValue] = useState(0.5);

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

  const openModal = () => setIsModalOpen(true);  // Open the modal
  const closeModal = () => setIsModalOpen(false); // Close the modal

  const [runTour, setRunTour] = useState(false); // State to control the tour

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
    setRunTour(true);
  }, []);


  useEffect(() => {
    const fethPrevData = async () => {
      try {
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

          if (
            response.data.demographics[0] != "" &&
            response.data.demographics[1] != ""
          ) {
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
        console.log("Setting hasFetchedInitialData to true");
        setHasFetchedInitialData(true);
      }
    };
    console.log("Prev Data CurrUser:", currUser, hasFetchedInitialData);
    if (currUser && !hasFetchedInitialData) {
      fethPrevData();
    }
  }, [currUser]);

  useEffect(() => {
    if (
      currUser &&
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
      console.log("Fetched Data and calling generate data");
      handleGenerate();
    }
  }, [hasFetchedInitialData]);

  useEffect(() => {
    const fetchDemographics = async (retries = 3, delay = 1000) => {
      console.log("fetchDemographics called with:", { currUser });

      // Check if currUser is available and proceed
      if (currUser) {
        try {
          const response = await axios.post(`${VITE_BACKEND_URL}/api/headers`, {
            curr_user: currUser,
          });

          // If there is an error in the response
          if (response.data.error) {
            setError(response.data.error);
          } else {
            // If the response is empty, retry logic will trigger
            if (Array.isArray(response.data) && response.data.length === 0) {
              console.log(
                "Received empty response for demographics, retrying..."
              );
              if (retries > 0) {
                setTimeout(
                  () => fetchDemographics(retries - 1, delay * 2),
                  delay
                ); // Exponential backoff
              } else {
                setError(
                  "Received empty response for demographics after multiple attempts"
                );
              }
            } else {
              console.log("Fetched Demographics:", response.data);
              setDemographics(response.data); // Set demographics data if not empty
            }
          }
        } catch (err) {
          console.error("Error fetching demographics", err);

          // Retry logic: only retry if there are remaining attempts
          if (retries > 0) {
            console.log(`Retrying... Attempts left: ${retries}`);
            setTimeout(() => fetchDemographics(retries - 1, delay * 2), delay); // Exponential backoff
          } else {
            setError("Error fetching demographics after multiple attempts");
          }
        }
      }
    };

    const timer = setTimeout(() => {
      fetchDemographics(); // Start fetching demographics or retrying if necessary
    }, 100);

    return () => clearTimeout(timer);
  }, [hasFetchedInitialData]); // Will trigger each time hasFetchedInitialData or currUser changes

  const fetchValues = async (retries = 3, delay = 1000) => {
    console.log("fetchValues called with:", { selectedDemographic, currUser });

    // Check if the selectedDemographic and currUser are available, and that demographicValues is empty
    if (selectedDemographic && currUser) {
      setDemographicValues([]);
      try {
        const response = await axios.post(
          `${VITE_BACKEND_URL}/api/values-under-header`,
          {
            curr_user: currUser,
            header: selectedDemographic,
          }
        );

        // If there is an error in the response data
        if (response.data.error) {
          setError(response.data.error);
        } else {
          // Check if the response data is empty
          if (Array.isArray(response.data) && response.data.length === 0) {
            console.log("Received empty list, retrying...");
            if (retries > 0) {
              // Retry with exponential backoff
              setTimeout(() => fetchValues(retries - 1, delay * 2), delay);
            } else {
              setError("Received empty response after multiple attempts");
            }
          } else {
            console.log("Fetched Values:", response.data);
            setDemographicValues(response.data); // Set values if not empty
          }
        }
      } catch (err) {
        console.error("Error fetching values", err);

        // Retry logic: only retry if there are remaining attempts
        if (retries > 0) {
          console.log(`Retrying... Attempts left: ${retries}`);
          setTimeout(() => fetchValues(retries - 1, delay * 2), delay); // Exponential backoff
        } else {
          setError("Error fetching values after multiple attempts");
        }
      }
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (selectedDemographic) {
        fetchValues();
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [selectedDemographic]);

  const fetchSecondValues = async (retries = 3, delay = 1000) => {
    console.log("fetchSecondValues called with:", {
      secondSelectedDemographic,
      currUser,
      secondDemographicValues,
    });

    // Check if the secondSelectedDemographic, currUser, and secondDemographicValues are available
    if (secondSelectedDemographic && currUser) {
      setSecondDemographicValues([]);
      try {
        const response = await axios.post(
          `${VITE_BACKEND_URL}/api/values-under-header`,
          {
            curr_user: currUser,
            header: secondSelectedDemographic,
          }
        );

        // If there is an error in the response data
        if (response.data.error) {
          setError(response.data.error);
        } else {
          // Check if the response data is empty
          if (Array.isArray(response.data) && response.data.length === 0) {
            console.log(
              "Received empty list for second demographic, retrying..."
            );
            if (retries > 0) {
              // Retry with exponential backoff
              setTimeout(
                () => fetchSecondValues(retries - 1, delay * 2),
                delay
              );
            } else {
              setError(
                "Received empty response for second demographic after multiple attempts"
              );
            }
          } else {
            console.log("Fetched second demographic values:", response.data);
            setSecondDemographicValues(response.data); // Set values if not empty
          }
        }
      } catch (err) {
        console.error("Error fetching second demographic values", err);

        // Retry logic: only retry if there are remaining attempts
        if (retries > 0) {
          console.log(`Retrying... Attempts left: ${retries}`);
          setTimeout(() => fetchSecondValues(retries - 1, delay * 2), delay); // Exponential backoff
        } else {
          setError(
            "Error fetching second demographic values after multiple attempts"
          );
        }
      }
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (selectedDemographic && secondSelectedDemographic) {
        fetchSecondValues();
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [secondSelectedDemographic]);

  const handleDemographicChange = (event) => {
    if (event.target.value === "") {
      setSelectedDemographic("");
      setSelectedValues(["", "", "", ""]);

      setSecondSelectedDemographic("");
      setSelectedSecondValues(["", "", "", ""]);
      return;
    } else if (event.target.value === secondSelectedDemographic) {
      setSelectedDemographic(event.target.value);
      setSelectedValues(["", "", "", ""]);

      setSecondSelectedDemographic("");
      setSelectedSecondValues(["", "", "", ""]);
      return;
    }
    setSelectedDemographic(event.target.value);
    setSelectedValues(["", "", "", ""]);
  };

  const handleSecondDemographicChange = (event) => {
    setSecondSelectedDemographic(event.target.value);
    setSelectedSecondValues(["", "", "", ""]);
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
    if (
      !currUser ||
      !timeframe
    ) {
      console.warn(
        "currUser or selectedDemographic is missing. Cannot generate data."
      );
      return;
    }

    if (!selectedDemographic || selectedValues[0] === "") {
      alert("Upload data and model and the select a demographic and values to generate data.");
      return;
    }

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
        console.log("Data generated:", response.data);
        if (response.data.length === 0) {
          alert("No data found for the selected demographics and values. Choose a different combination.");
          return;
        }
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

  // const handleSliderChange = (event) => {
  //   setSliderValue(parseFloat(event.target.value));
  //   console.log("Slider Value:", event.target.value); // For debugging
  // };
  const handleSliderValueChange = (value) => {
    console.log('Slider Value:', value); // Handle the slider value update
  };

  // useEffect(() => {
  //   setGraphData([
  //     {
  //       feature1: "Black",
  //       feature2: "Female",
  //       accuracy: 0.25,
  //       falsepositive: 0.75,
  //       falsenegative: 0.0,
  //       combination_label: "Black Female",
  //     },
  //     {
  //       feature1: "Black",
  //       feature2: "Male",
  //       accuracy: 0.2,
  //       falsepositive: 0.0,
  //       falsenegative: 1.0,
  //       combination_label: "Black Male",
  //     },
  //     {
  //       feature1: "Black",
  //       feature2: "Non-binary",
  //       accuracy: 0.5,
  //       falsepositive: 0.0,
  //       falsenegative: 0.5,
  //       combination_label: "Black Non-binary",
  //     },
  //     {
  //       feature1: "Hispanic",
  //       feature2: "Female",
  //       accuracy: 0.33,
  //       falsepositive: 0.67,
  //       falsenegative: 0.0,
  //       combination_label: "Hispanic Female",
  //     },
  //     {
  //       feature1: "Hispanic",
  //       feature2: "Male",
  //       accuracy: 0.5,
  //       falsepositive: 0.0,
  //       falsenegative: 0.5,
  //       combination_label: "Hispanic Male",
  //     },
  //     {
  //       feature1: "Hispanic",
  //       feature2: "Non-binary",
  //       accuracy: 1.0,
  //       falsepositive: 0.0,
  //       falsenegative: 0.0,
  //       combination_label: "Hispanic Non-binary",
  //     },
  //     {
  //       feature1: "Other",
  //       feature2: "Female",
  //       accuracy: 0.67,
  //       falsepositive: 0.0,
  //       falsenegative: 0.33,
  //       combination_label: "Other Female",
  //     },
  //     {
  //       feature1: "Other",
  //       feature2: "Male",
  //       accuracy: 0.75,
  //       falsepositive: 0.25,
  //       falsenegative: 0.0,
  //       combination_label: "Other Male",
  //     },
  //     {
  //       feature1: "Other",
  //       feature2: "Non-binary",
  //       accuracy: 0.7,
  //       falsepositive: 0.0,
  //       falsenegative: 1.0,
  //       combination_label: "Other Non-binary",
  //     },
  //     {
  //       feature1: "Black",
  //       feature2: "Other",
  //       accuracy: 0.56,
  //       falsepositive: 0.0,
  //       falsenegative: 1.0,
  //       combination_label: "Black Other",
  //     },
  //     {
  //       feature1: "Hispanic",
  //       feature2: "Other",
  //       accuracy: 0.42,
  //       falsepositive: 0.0,
  //       falsenegative: 1.0,
  //       combination_label: "Hispanic Other",
  //     },
  //     {
  //       feature1: "White",
  //       feature2: "Male",
  //       accuracy: 0.2,
  //       falsepositive: 0.25,
  //       falsenegative: 0.0,
  //       combination_label: "Wite Male",
  //     },
  //     {
  //       feature1: "White",
  //       feature2: "Non-binary",
  //       accuracy: 0.5,
  //       falsepositive: 0.0,
  //       falsenegative: 1.0,
  //       combination_label: "White Non-binary",
  //     },
  //     {
  //       feature1: "White",
  //       feature2: "Other",
  //       accuracy: 0.64,
  //       falsepositive: 0.0,
  //       falsenegative: 1.0,
  //       combination_label: "White Other",
  //     },
  //   ]);
  // }, []);

  // useEffect(() => {
  //   console.log("Graph data updated:", graphData);
  // }, [graphData]);

  return (
    <div className="dashboard-container">
      <TourGuide runTour={runTour} />

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
        <div>
          <Slider graphData={graphData} maxValue={maxValue} />
        </div>

        <div className="select-demographics-2">
          <div className="demog-clas">
            <h2>Demographics</h2>
          </div>
          <div className="select-demographics">
            <div className="title"></div>
            <div className="select-container1">
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
                <div className="select-options1">
                  <h3 className="demographic-heading">
                    Values for 1st Demographic
                  </h3>
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
              <div className="select-container2">
                <select
                  onChange={handleSecondDemographicChange}
                  value={secondSelectedDemographic}
                >
                  <option value="">Select</option>
                  {demographics
                    .filter((demo) => demo !== selectedDemographic)
                    .map((demo, index) => (
                      <option key={index} value={demo}>
                        {demo}
                      </option>
                    ))}
                </select>

                {secondSelectedDemographic && selectedDemographic && (
                  <div className="select-options2">
                    <h3 className="demographic-heading">
                      Values for 2nd Demographic
                    </h3>
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
          {selectedDemographic && <div className="generate-btn-container">
            <button className="generate-button" onClick={handleGenerate}>
              Generate
            </button>
          </div>}
        </div>
        <button className="info-button" onClick={openModal}>?</button>
        {isModalOpen && <Modal closeModal={closeModal} />}
      </div>
      <div className="upload-buttons">
        <ControlButtons onDownload={handleDownload} />
      </div>
    </div>
  );
};

export default Dashboard;