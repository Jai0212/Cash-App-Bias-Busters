// src/ChartComponent.jsx
import React, {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";
import Chart from "chart.js/auto";

const ChartComponent = forwardRef(({ data }, ref) => {
  const chartRef = useRef(null);
  const myChartRef = useRef(null);

  useEffect(() => {
    const ctx = chartRef.current.getContext("2d");

    if (myChartRef.current) {
      myChartRef.current.destroy();
    }

    myChartRef.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: data.labels,
        datasets: data.datasets.map((dataset) => ({
          ...dataset,
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderWidth: 1,
        })),
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });

    return () => {
      if (myChartRef.current) {
        myChartRef.current.destroy();
      }
    };
  }, [data]);

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