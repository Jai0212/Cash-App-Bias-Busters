// TimeButtons.jsx
import React from "react";
import "./TimeButtons.css";

const TimeButtons = ({ handleTimeframeChange, timeframe, lastTabIndex }) => {
  return (
    <div className="timeframe-buttons">
      <button
        className={timeframe === "day" ? "active-button" : ""}
        onClick={() => handleTimeframeChange("day")}
        tabIndex={lastTabIndex + 1}
      >
        1 Day
      </button>
      <button
        className={timeframe === "week" ? "active-button" : ""}
        onClick={() => handleTimeframeChange("week")}
        tabIndex={lastTabIndex + 2}
      >
        1 Week
      </button>
      <button
        className={timeframe === "month" ? "active-button" : ""}
        onClick={() => handleTimeframeChange("month")}
        tabIndex={lastTabIndex + 3}
      >
        1 Month
      </button>
      <button
        className={timeframe === "year" ? "active-button" : ""}
        onClick={() => handleTimeframeChange("year")}
        tabIndex={lastTabIndex + 4}
      >
        1 Year
      </button>
    </div>
  );
};

export default TimeButtons;
