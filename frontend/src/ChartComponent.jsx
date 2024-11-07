import React, {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";
import Chart from "chart.js/auto";

const ChartComponent = forwardRef(({ data, sliderValue }, ref) => {
  const chartRef = useRef(null);
  const myChartRef = useRef(null);

  useEffect(() => {
    const ctx = chartRef.current.getContext("2d");

    // Destroy the previous chart instance if it exists
    if (myChartRef.current) {
      myChartRef.current.destroy();
    }

    // Create the line dataset, which spans across all x-axis labels
    const lineData = {
      label: "Line Overlay",
      data: new Array(data.labels.length).fill(sliderValue), // The line is constant at sliderValue
      borderColor: "rgba(255, 99, 132, 1)", // Red line color
      backgroundColor: "rgba(0, 0, 0, 0)", // No background fill
      fill: false, // No fill under the line
      borderWidth: 2,
      tension: 0.6, // Smooth the line
      pointRadius: 0, // No points on the line
      type: "line", // Line chart type
      zIndex: 4, // Make sure this line is above the bars
    };

    // Calculate max y-axis value to accommodate the line
    const maxYValue = Math.max(
        sliderValue,
        ...data.datasets.flatMap((dataset) => dataset.data)
    );

    // Create the chart with bars and the line overlay
    myChartRef.current = new Chart(ctx, {
      type: "bar", // Base chart type is bar
      data: {
        labels: data.labels,
        datasets: [
          ...data.datasets.map((dataset) => ({
            ...dataset,
            backgroundColor: "rgba(75, 192, 192, 0.2)", // Bar color
            borderWidth: 1,
            zIndex: 1, // Bars should be below the line
          })),
          lineData, // The line dataset
        ],
      },
      options: {
        scales: {
          x: {
            // Ensure x-axis spans all labels
            ticks: {
              autoSkip: false, // Prevent auto skipping of x-axis labels
            },
          },
          y: {
            min: 0, // Set the minimum value of the y-axis to 0
            max: 1, // Dynamically adjust max y-axis to fit the line
            beginAtZero: true, // Ensure the y-axis starts at 0
          },
        },
      },
    });

    return () => {
      if (myChartRef.current) {
        myChartRef.current.destroy();
      }
    };
  }, [data, sliderValue]); // Re-render chart when data or sliderValue changes

  useImperativeHandle(ref, () => ({
    downloadChart() {
      const link = document.createElement("a");
      link.href = chartRef.current.toDataURL("image/png");
      link.download = "chart.png";
      link.click();
    },
  }));

  return <canvas ref={chartRef} />;
});

export default ChartComponent;