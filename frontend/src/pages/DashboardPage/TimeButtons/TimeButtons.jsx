// TimeButtons.jsx
import React from "react";
import "./TimeButtons.css";

const TimeButtons = ({ handleTimeframeChange, timeframe }) => {
  return (
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
  );
};

export default TimeButtons;
