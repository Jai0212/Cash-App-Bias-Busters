import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

const ChartComponent = () => {
  const chartRef = useRef(null);
  const myChartRef = useRef(null); // Add this line

  useEffect(() => {
    const ctx = chartRef.current.getContext("2d");

    // Destroy the previous chart instance if it exists
    if (myChartRef.current) {
      myChartRef.current.destroy();
    }

    // Create a new chart instance
    myChartRef.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: ["January", "February", "March", "April", "May", "June"], // Main label to be put on x-axis
        datasets: [
          {
            label: "We need to put the label here", // Label for the line 1 legend (What is line 1 representing)
            data: [10, 50, 30, 60, 40, 80], // Actual data points represented by line 1
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
          },
          {
            label: "Random Data label 2", // Label for the line 1 legend (What is line 2 representing)
            data: [20, 40, 60, 30, 70, 50], // Actual data points represented by line 2
            backgroundColor: "rgba(255, 99, 132, 0.2)",
            borderColor: "rgba(255, 99, 132, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });

    // Cleanup function to destroy the chart when the component unmounts
    return () => {
      if (myChartRef.current) {
        myChartRef.current.destroy();
      }
    };
  }, []);

  return <canvas ref={chartRef} />;
};

export default ChartComponent;
