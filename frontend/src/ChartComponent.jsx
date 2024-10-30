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
        labels: ["January", "February", "March", "April", "May", "June"],
        datasets: [
          {
            label: "We need to put the label here",
            data: [10, 50, 30, 60, 40, 80],
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            borderColor: "rgba(75, 192, 192, 1)",
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
