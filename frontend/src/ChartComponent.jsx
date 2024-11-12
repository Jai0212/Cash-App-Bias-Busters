import React, {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
  useState,
} from "react";
import Chart from "chart.js/auto";
import "./ChartComponent.css";

const ChartComponent = forwardRef(({ chartData, sliderValue }, ref) => {
  const chartRef = useRef(null);
  const myChartRef = useRef(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  useEffect(() => {
    if (!chartData) return;

    // Step 1: Identify unique feature1 values and assign colors dynamically
    const uniqueFeature1Groups = Array.from(
      new Set(chartData.map((item) => item.feature1))
    );
    const colorPalette = [
      "rgba(54, 162, 235, 0.7)",
      "rgba(75, 192, 192, 0.7)",
      "rgba(255, 206, 86, 0.7)",
      "rgba(153, 102, 255, 0.7)",
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

    const accuracyData = sortedChartData.map((item) => ({
      label: item.feature2, // Use only feature2 as label
      accuracy: item.accuracy,
      falsePositive: item.falsepositive,
      falseNegative: item.falsenegative,
      color: feature1Colors[item.feature1] || "rgba(200, 200, 200, 0.7)", // Default gray if missing
    }));

    // Configure datasets with accuracy data and colors by group
    const datasets = [
      {
        label: "Accuracy",
        data: accuracyData.map((d) => ({ x: d.label, y: d.accuracy })),
        backgroundColor: accuracyData.map((d) => d.color), // Bars are filled with the color for each feature1 group
        borderColor: accuracyData.map(
          (d) => (d.accuracy > sliderValue ? "rgba(255, 0, 0, 1)" : d.color) // Red border if above threshold, else use the same color as fill
        ),
        borderWidth: accuracyData.map(
          (d) => (d.accuracy > sliderValue ? 3 : 1) // Increased border width if above threshold, else default
        ),
        borderCapStyle: "round",
        borderJoinStyle: "round",
      },
    ];

    // Threshold line
    const lineData = {
      label: "Threshold",
      data: labels.map((label) => ({ x: label, y: sliderValue })),
      borderColor: "rgba(0, 0, 255, 1)",
      backgroundColor: "rgba(0, 0, 0, 0)",
      fill: false,
      borderWidth: 2,
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
              autoSkip: false,
            },
            grid: {
              offset: true,
              display: false,
            },
          },
          y: {
            min: 0,
            max: 1,
            beginAtZero: true,
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
                const item = accuracyData[tooltipItem.dataIndex];
                return [
                  `Accuracy: ${item.accuracy}`,
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
  }, [chartData, sliderValue]); // Removed hoveredIndex dependency

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
