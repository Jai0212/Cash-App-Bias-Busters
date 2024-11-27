import React, { useEffect, useRef, useImperativeHandle, forwardRef, useState } from "react";
import Chart from "chart.js/auto";
import "./ChartComponent.css";

const ChartComponent = forwardRef(({ chartData, sliderValue }, ref) => {
  const chartRef = useRef(null);
  const myChartRef = useRef(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [accuracyData, setAccuracyData] = useState([]);  // Store accuracyData in state

  useEffect(() => {
    if (!chartData) return;

    console.log("Rendering chart with data:", chartData);

    // Step 1: Identify unique feature1 values and assign colors dynamically
    const uniqueFeature1Groups = Array.from(
      new Set(chartData.map((item) => item.feature1))
    );
    const colorPalette = [
      "rgba(189, 178, 255, 0.9)",
      "rgba(253, 255, 182, 0.9)",
      "rgba(251, 224, 224, 0.9)",
      "rgba(229, 193, 133, 0.9)"
    ];
    const feature1Colors = uniqueFeature1Groups.reduce((acc, group, index) => {
      acc[group] = colorPalette[index % colorPalette.length];
      return acc;
    }, {});

    // Step 2: Sort and prepare data for the chart
    const sortedChartData = [...chartData].sort((a, b) =>
      a.feature1.localeCompare(b.feature1)
    );

    const labels = sortedChartData.map((item) => item.feature2); // Only feature2 labels

    const newAccuracyData = sortedChartData.map((item) => ({
      label: item.feature2, 
      accuracy: item.accuracy,
      falsePositive: item.falsepositive,
      falseNegative: item.falsenegative,
      color: feature1Colors[item.feature1] || "rgba(200, 200, 200, 0.7)", 
    }));

    
    setAccuracyData(newAccuracyData);

    
    const datasets = [
      {
        label: "Accuracy",
        data: newAccuracyData.map((d) => ({ x: d.label, y: d.accuracy })),
        backgroundColor: newAccuracyData.map((d) => d.color), 
        borderColor: newAccuracyData.map(
          (d) => (d.accuracy > sliderValue ? "rgba(255, 0, 0, 1)" : d.color) 
        ),
        borderWidth: newAccuracyData.map(
          (d) => (d.accuracy > sliderValue ? 3 : 1) 
        ),
        borderCapStyle: "round",
        borderJoinStyle: "round",
      },
    ];

    
    const lineData = {
      label: "Threshold",
      data: labels.map((label) => ({ x: label, y: sliderValue })),
      borderColor: "rgba(255, 0, 0, 1)",
      backgroundColor: "rgba(0, 0, 0, 0)",
      fill: false,
      borderWidth: 3,
      type: "line",
      pointRadius: 0,
    };

    const data = {
      labels: labels,
      datasets: [...datasets, lineData],
    };

    const ctx = chartRef.current.getContext("2d");

    if (myChartRef.current) {
      myChartRef.current.destroy();
    }

    myChartRef.current = new Chart(ctx, {
      type: "bar",
      data: data,
      options: {
        scales: {
          x: {
            offset: true,
            ticks: {
              color: "rgba(255, 255, 255, 1)",
              autoSkip: false,
            },
            grid: {
              offset: true,
              display: false,
              color: "rgba(255, 255, 255, 0.4)",
            },
            title: {
              color: "rgba(255, 255, 255, 1)",
              display: true,
              text: 'Demographics',
              font: {
                size: 16,
                weight: 'bold',
              },
              padding: {
                top: 8,
              },
            },
          },
          y: {
            min: 0,
            max: 1,
            beginAtZero: true,
            ticks: {
              color: "rgba(255, 255, 255, 1)",
              autoSkip: false,
            },
            grid: {
              offset: true,
              display: true,
              color: "rgba(255, 255, 255, 0.4)",
            },
            title: {
              display: true,
              text: 'Bias',
              color: "rgba(255, 255, 255, 1)",
              font: {
                size: 16,
                weight: 'bold',
              },
              padding: {
                bottom: 8,
              },
            },
          },
        },
        responsive: true,
        plugins: {
          legend: {
            display: true,
            labels: {
              generateLabels: () => {
                return uniqueFeature1Groups.map((feature1, i) => ({
                  text: feature1,
                  fontColor: "white",
                  fillStyle: feature1Colors[feature1],
                  strokeStyle: feature1Colors[feature1],
                  lineWidth: 1,
                }));
              },
            },
          },
          tooltip: {
            callbacks: {
              label: (tooltipItem) => {
                const item = newAccuracyData[tooltipItem.dataIndex];
                return [
                  `Bias: ${item.accuracy}`,
                  `False Positive: ${item.falsePositive}`,
                  `False Negative: ${item.falseNegative}`,
                ];
              },
            },
          },
        },
        onHover: (event, elements) => {
          if (elements.length) {
            setHoveredIndex(elements[0].index);
          } else {
            setHoveredIndex(null);
          }
        },
      },
      plugins: [
        {
          id: "highlightColumn",
          afterDraw: (chart) => {
            if (hoveredIndex === null) return;

            const { ctx, chartArea, scales } = chart;
            const bar = chart.getDatasetMeta(0).data[hoveredIndex];
            const left = bar.x - bar.width / 2;
            const right = bar.x + bar.width / 2;

            ctx.save();
            ctx.fillStyle = "rgba(200, 200, 200, 0.3)";
            ctx.fillRect(
              left,
              chartArea.top,
              right - left,
              chartArea.bottom - chartArea.top
            );
            ctx.restore();
          },
        },
      ],
    });
  }, [chartData, sliderValue]);

  
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Tab') {
        const nextIndex = hoveredIndex === null
          ? 0
          : (hoveredIndex + 1) % accuracyData.length;

        setHoveredIndex(nextIndex); 
      }
    };

    
    window.addEventListener('keydown', handleKeyDown);

    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [hoveredIndex, accuracyData.length]); 

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
      <canvas ref={chartRef} tabIndex="0" /> 
    </div>
  );
});

export default ChartComponent;
