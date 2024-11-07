import React, {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";
import Chart from "chart.js/auto";

<<<<<<< HEAD
const ChartComponent = forwardRef(({ data, sliderValue }, ref) => {
=======
const ChartComponent = forwardRef(({ data, sliderValue, bias }, ref) => {
>>>>>>> 8be01aded6d0a947bbb11f7e39b163156e8ec006
  const chartRef = useRef(null);
  const myChartRef = useRef(null);

  useEffect(() => {
    const ctx = chartRef.current.getContext("2d");

    // Destroy the previous chart instance if it exists
    if (myChartRef.current) {
      myChartRef.current.destroy();
    }

<<<<<<< HEAD
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

=======
    // Create the line dataset with higher zIndex to ensure it is above the bars
    const lineData = {
      label: "Line Overlay",
      data: new Array(data.labels.length).fill(sliderValue), // The line is constant at sliderValue
      borderColor: "rgba(0, 0, 255, 2)", // Inverted red color
      backgroundColor: "rgba(0, 0, 0, 0)", // No background fill
      fill: false, // No fill under the line
      borderWidth: 2, // Thicker line for visibility
      tension: 0.4, // Smooth the line moderately
      pointRadius: 0, // No points on the line
      type: "line", // Line chart type
      zIndex: 10, // Ensure the line is above the bars
    };

    // Step: Create bar colors based on slider value and bias
    const barColors = data.datasets[0].data.map((value) => {
      // If sliderValue is greater than bias, color the bar red
      return sliderValue > bias ? "rgba(255, 0, 0, 0.1)" : "rgba(0, 255, 0, 0.1)";
    });

>>>>>>> 8be01aded6d0a947bbb11f7e39b163156e8ec006
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
<<<<<<< HEAD
          ...data.datasets.map((dataset) => ({
            ...dataset,
            backgroundColor: "rgba(75, 192, 192, 0.2)", // Bar color
            borderWidth: 1,
            zIndex: 1, // Bars should be below the line
          })),
=======
          {
            ...data.datasets[0],
            backgroundColor: barColors, // Dynamically set bar colors based on comparison
            borderWidth: 1,
            zIndex: 1, // Bars should be below the line
          },
>>>>>>> 8be01aded6d0a947bbb11f7e39b163156e8ec006
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
<<<<<<< HEAD
            max: 1, // Dynamically adjust max y-axis to fit the line
=======
            max: 1, // Adjust max y-axis to fit the line properly
>>>>>>> 8be01aded6d0a947bbb11f7e39b163156e8ec006
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
<<<<<<< HEAD
  }, [data, sliderValue]); // Re-render chart when data or sliderValue changes
=======
  }, [data, sliderValue, bias]); // Re-render chart when data, sliderValue, or bias changes
>>>>>>> 8be01aded6d0a947bbb11f7e39b163156e8ec006

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