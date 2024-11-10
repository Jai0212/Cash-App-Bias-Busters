import React, {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";
import Chart from "chart.js/auto";
import "./ChartComponent.css";

const ChartComponent = forwardRef(({ chartData, sliderValue, bias }, ref) => {
  const chartRef = useRef(null);
  const myChartRef = useRef(null);

  useEffect(() => {
    if (!chartData) return;

    const labels = Object.keys(chartData); // Use keys as labels (Gender_Age Range)

    // Prepare bar data with conditional coloring based on the slider value
    const datasets = [
      {
        label: "Values",
        data: labels.map((key) => ({
          x: key, // Use key as x-axis label
          y: chartData[key][0], // Use the first value from each array as y-coordinate
        })),
        backgroundColor: labels.map((key) =>
          chartData[key][0] > sliderValue
            ? "rgba(255, 0, 0, 0.7)"
            : "rgba(0, 230, 0, 0.7)"
        ), // Color red if value is greater than slider value, otherwise green
        borderColor: "rgba(0, 0, 0, 0.1)",
        borderWidth: 1,
      },
    ];

    // Line Data: constant at sliderValue
    const lineData = {
      label: "Line Overlay",
      data: datasets[0].data.map((dataPoint) => ({
        x: dataPoint.x,
        y: sliderValue,
      })), // Create line data with constant y-value
      borderColor: "rgba(0, 0, 255, 2)", // Inverted red color
      backgroundColor: "rgba(0, 0, 0, 0)", // No background fill
      fill: false, // No fill under the line
      borderWidth: 2, // Thicker line for visibility
      tension: 0.4, // Smooth the line moderately
      pointRadius: 0, // No points on the line
      type: "line", // Line chart type
      zIndex: 10, // Ensure the line is above the bars
    };

    const data = {
      labels: labels, // Gender_Age Range keys as labels
      datasets: [
        datasets[0], // Bar dataset with conditional coloring
        lineData, // The line dataset
      ],
    };

    const ctx = chartRef.current.getContext("2d");

    if (myChartRef.current) {
      myChartRef.current.destroy();
    }

    // Initialize the chart with bars and the line overlay
    myChartRef.current = new Chart(ctx, {
      type: "bar", // Base chart type is bar
      data: data,
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

    return () => {
      if (myChartRef.current) {
        myChartRef.current.destroy(); // Clean up chart on component unmount
      }
    };
  }, [chartData, sliderValue, bias]);

  useImperativeHandle(ref, () => ({
    downloadChart() {
      const link = document.createElement("a");
      link.href = chartRef.current.toDataURL("image/png");
      link.download = "chart.png";
      link.click();
    },
  }));

  return (
    <div className="chart-container">
      <canvas ref={chartRef} />
    </div>
  );
});

export default ChartComponent;
