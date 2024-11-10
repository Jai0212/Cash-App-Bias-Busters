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

    // Define demographic labels mapping
    const demographicMapping = {
      gender: ["Male", "Female", "Non-binary", "Other"],
      // Add more mappings for other demographics if needed
    };

    // Determine the type of demographic (e.g., gender, race) based on chartData keys
    const determineDemographicType = (keys) => {
      // Example logic to determine demographic type, you may need to adjust this
      if (
        keys.some((key) => key.startsWith("Male_") || key.startsWith("Female_"))
      ) {
        return "gender";
      }
      // Add more conditions for other demographic types
      return "default";
    };

    const keys = Object.keys(chartData);
    const demographicType = determineDemographicType(keys);

    const labels = demographicMapping[demographicType] || keys; // Use mapped labels or default keys

    // Group data by demographic type
    const groupData = (data, mapping) => {
      const result = mapping.map(() => []);
      Object.entries(data).forEach(([key, values]) => {
        const index = mapping.findIndex((label) => key.startsWith(label));
        if (index !== -1) {
          result[index].push({
            ageRange: key.split("_")[1], // Extract age range
            value: values[0], // Use the first value from each array
          });
        }
      });
      return result;
    };

    const groupedData = groupData(
      chartData,
      demographicMapping[demographicType] || labels
    );

    // Prepare datasets for grouped bars
    const datasets = groupedData.flatMap((group, i) =>
      group.map((item, j) => ({
        label: `${labels[i]} (${item.ageRange})`,
        data: [{ x: labels[i], y: item.value }],
        backgroundColor:
          item.value > sliderValue
            ? "rgba(255, 0, 0, 0.7)"
            : "rgba(0, 230, 0, 0.7)",
        borderColor: "rgba(0, 0, 0, 0.1)",
        borderWidth: 1,
      }))
    );

    // Line Data: constant at sliderValue
    const lineData = {
      label: "Line Overlay",
      data: groupedData.flatMap((group, i) =>
        group.map((item, j) => ({
          x: labels[i],
          y: sliderValue,
        }))
      ),
      borderColor: "rgba(0, 0, 255, 2)",
      backgroundColor: "rgba(0, 0, 0, 0)",
      fill: false,
      borderWidth: 2,
      tension: 0.4,
      pointRadius: 0,
      type: "line",
      zIndex: 10,
    };

    const data = {
      labels: labels,
      datasets: [...datasets, lineData],
    };

    const ctx = chartRef.current.getContext("2d");

    if (myChartRef.current) {
      myChartRef.current.destroy();
    }

    // Initialize the chart with grouped bars and the line overlay
    myChartRef.current = new Chart(ctx, {
      type: "bar",
      data: data,
      options: {
        scales: {
          x: {
            ticks: {
              autoSkip: false,
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
            position: "top",
          },
          title: {
            display: true,
            text: "Grouped Bar Chart",
          },
        },
      },
    });

    return () => {
      if (myChartRef.current) {
        myChartRef.current.destroy();
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
