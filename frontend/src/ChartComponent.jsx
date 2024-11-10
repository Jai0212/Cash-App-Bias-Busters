import React, {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";
import Chart from "chart.js/auto";
import "./ChartComponent.css";

const ChartComponent = forwardRef(({ chartData, sliderValue, bias }, ref) => {
  const barChartRef = useRef(null);
  const scatterChartRef = useRef(null);
  const barChartInstanceRef = useRef(null);
  const scatterChartInstanceRef = useRef(null);

  useEffect(() => {
    if (!chartData) return;

    const labels = Object.keys(chartData); // Use keys as labels (Gender_Age Range)

    // Prepare bar data with conditional coloring based on the slider value
    const barData = {
      labels: labels, // Gender_Age Range keys as labels
      datasets: [
        {
          label: "Values",
          data: labels.map((key) => chartData[key][0]), // Use only the first value from each array
          backgroundColor: labels.map((key) =>
            chartData[key][0] > sliderValue
              ? "rgba(255, 0, 0, 0.7)"
              : "rgba(0, 230, 0, 0.7)"
          ), // Color red if value is greater than slider value, otherwise green
          borderColor: "rgba(0, 0, 0, 0.1)",
          borderWidth: 1,
        },
      ],
    };

    // Line Data: constant at sliderValue
    const lineData = {
      label: "Line Overlay",
      data: labels.map((_, index) => ({ x: index, y: sliderValue })), // Create line data with constant y-value
      borderColor: "rgba(0, 0, 255, 2)", // Inverted red color
      backgroundColor: "rgba(0, 0, 0, 0)", // No background fill
      fill: false, // No fill under the line
      borderWidth: 2, // Thicker line for visibility
      tension: 0.4, // Smooth the line moderately
      pointRadius: 0, // No points on the line
      type: "line", // Line chart type
      zIndex: 10, // Ensure the line is above the bars
    };

    // Prepare scatter data with conditional coloring
    const scatterData = labels.map((key, index) => ({
      x: index, // Use index as x-coordinate
      y: chartData[key][0], // Use the first value from each array as y-coordinate
      backgroundColor:
        chartData[key][0] > sliderValue
          ? "rgba(255, 0, 0, 0.7)"
          : "rgba(0, 230, 0, 0.7)",
    }));

    const scatterPlotData = {
      datasets: [
        {
          label: "Scatter Values",
          data: scatterData, // Data for scatter plot
          backgroundColor: scatterData.map((data) => data.backgroundColor), // Apply conditional coloring
          pointRadius: 5, // Point size
        },
      ],
    };

    const barCtx = barChartRef.current.getContext("2d");
    const scatterCtx = scatterChartRef.current.getContext("2d");

    // Destroy previous chart instances if they exist
    if (barChartInstanceRef.current) {
      barChartInstanceRef.current.destroy();
    }
    if (scatterChartInstanceRef.current) {
      scatterChartInstanceRef.current.destroy();
    }

    // Initialize the bar chart with bars and the line overlay
    barChartInstanceRef.current = new Chart(barCtx, {
      type: "bar", // Base chart type is bar
      data: {
        ...barData,
        datasets: [
          ...barData.datasets,
          lineData, // The line dataset
        ],
      },
      options: {
        scales: {
          x: {
            ticks: {
              autoSkip: false, // Prevent auto skipping of x-axis labels
            },
          },
          y: {
            min: 0,
            max: 1, // Dynamically adjust max value
            beginAtZero: true,
          },
        },
      },
    });

    // Initialize the scatter plot with conditional coloring
    scatterChartInstanceRef.current = new Chart(scatterCtx, {
      type: "scatter",
      data: scatterPlotData,
      options: {
        scales: {
          x: {
            type: "linear", // Ensure x-axis is linear
            position: "bottom", // Position x-axis at the bottom
            ticks: {
              callback: function (value) {
                return scatterData[value] ? labels[value] : ""; // Display labels on x-axis
              },
              autoSkip: false, // Prevent auto skipping of x-axis labels
            },
          },
          y: {
            min: 0,
            max: 1, // Dynamically adjust max value
            beginAtZero: true,
          },
        },
      },
    });

    return () => {
      if (barChartInstanceRef.current) {
        barChartInstanceRef.current.destroy(); // Clean up bar chart on component unmount
      }
      if (scatterChartInstanceRef.current) {
        scatterChartInstanceRef.current.destroy(); // Clean up scatter chart on component unmount
      }
    };
  }, [chartData, sliderValue, bias]);

  useImperativeHandle(ref, () => ({
    downloadChart() {
      const link = document.createElement("a");
      link.href = barChartRef.current.toDataURL("image/png");
      link.download = "chart.png";
      link.click();
    },
  }));

  return (
    <div className="chart-container">
      <div className="bar-chart">
        <canvas ref={barChartRef} />
      </div>
      <div className="scatter-chart">
        <canvas ref={scatterChartRef} />
      </div>
    </div>
  );
});

export default ChartComponent;
