import React, { useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import Chart from "chart.js/auto";

const ChartComponent = forwardRef(({ chartData, sliderValue, bias }, ref) => {
  const chartRef = useRef(null);
  const myChartRef = useRef(null);

  // const chartData = {
  //   'Female_18-26': [0.446, 0.0, 0.554],
  //   'Female_27-35': [0.577, 0.423, 0.0],
  //   'Female_36-44': [0.404, 0.596, 0.0],
  //   'Female_45-53': [0.436, 0.564, 0.0],
  //   'Female_54-62': [0.55, 0.45, 0.0],
  //   'Male_18-26': [0.56, 0.0, 0.44],
  //   'Male_27-35': [0.457, 0.0, 0.543],
  //   'Male_36-44': [0.403, 0.0, 0.597],
  //   'Male_45-53': [0.571, 0.0, 0.429],
  //   'Male_54-62': [0.54, 0.0, 0.46],
  //   'Non-binary_18-26': [0.55, 0.0, 0.45],
  //   'Non-binary_27-35': [0.558, 0.0, 0.442],
  //   'Non-binary_36-44': [0.654, 0.0, 0.346],
  //   'Non-binary_45-53': [0.359, 0.0, 0.641],
  //   'Non-binary_54-62': [0.434, 0.0, 0.566],
  //   'Other_18-26': [0.535, 0.465, 0.0],
  //   'Other_27-35': [0.36, 0.64, 0.0],
  //   'Other_36-44': [0.492, 0.508, 0.0],
  //   'Other_45-53': [0.511, 0.489, 0.0],
  //   'Other_54-62': [0.494, 0.506, 0.0]
  // };

  useEffect(() => {
    console.log("Chart data received", chartData);
    if (!chartData) return;

    const labels = Object.keys(chartData); // Use keys as labels (Gender_Age Range)
    
    const datasets = [
      {
        label: "Values",
        data: labels.map((key) => chartData[key][0]), // Use only the first value from each array
        backgroundColor: labels.map((_, index) => `rgba(${index * 40}, ${100 + index * 40}, ${150 - index * 30}, 0.6)`),
      }
    ];

    // Line Data: constant at sliderValue
    const lineData = {
      label: "Line Overlay",
      data: new Array(labels.length).fill(sliderValue), // The line is constant at sliderValue
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
    const barColors = datasets[0].data.map((value) => {
      // If sliderValue is greater than bias, color the bar red
      return sliderValue < bias ? "rgba(255, 0, 0, 0.7)" : "rgba(0, 255, 0, 0.7)";
    });

    // Calculate max y-axis value to accommodate the line
    const maxYValue = Math.max(
        sliderValue,
        ...datasets.flatMap((dataset) => dataset.data)
    );

    const data = {
      labels: labels, // Gender_Age Range keys as labels
      datasets: [
        {
          ...datasets[0],
          backgroundColor: barColors, // Dynamically set bar colors based on comparison
          borderWidth: 1,
          zIndex: 1, // Bars should be below the line
        },
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

  return <canvas ref={chartRef} />;
});

export default ChartComponent;
