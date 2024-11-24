// TimeButtons.jsx
import React from "react";
import "./TimeButtons.css";


const TimeButtons = ({ handleTimeframeChange, timeframe }) => {
  const handleKeyDown = (event, timeFrame) => {
    if (event.key === 'Enter') {
      handleTimeframeChange(timeFrame);
    }
  };

  return (
    <div className="timeframe-buttons">
      <button
        className={timeframe === "day" ? "active-button" : ""}
        onClick={() => handleTimeframeChange("day")}
        tabIndex={2}
      >
        1 Day
      </button>
      <button
        className={timeframe === "week" ? "active-button" : ""}
        onClick={() => handleTimeframeChange("week")}
        tabIndex={3}
      >
        1 Week
      </button>
      <button
        className={timeframe === "month" ? "active-button" : ""}
        onClick={() => handleTimeframeChange("month")}
        tabIndex={4}
      >
        1 Month
      </button>
      <button
        className={timeframe === "year" ? "active-button" : ""}
        onClick={() => handleTimeframeChange("year")}
        tabIndex={5}
      >
        1 Year
      </button>
    </div>
  );
};

export default TimeButtons;
