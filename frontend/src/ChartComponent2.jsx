import React, { useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import Chart from "chart.js/auto";
import './ChartComponent2.css';

const ChartComponent2 = forwardRef(({ chartData }, ref) => {
    const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

    const chartRef = useRef(null);
    const myChartRef = useRef(null);

    useEffect(() => {
        if (!chartData) return;

        const labels = Object.keys(chartData); // Use keys as labels

        const datasets = [
            {
                label: "Values",
                data: labels.map((key) => chartData[key][0]), // Use the first value from each array
                backgroundColor: labels.map((_, index) => `rgba(${index * 40}, ${100 + index * 40}, ${150 - index * 30}, 0.6)`),
            }
        ];

        const data = {
            labels: labels, // Gender_Age Range keys as labels
            datasets: datasets,
        };

        const ctx = chartRef.current.getContext("2d");

        if (myChartRef.current) {
            myChartRef.current.destroy();
        }

        // Initialize the chart with a bar graph
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
                        beginAtZero: true, // Start y-axis at zero
                    },
                },
            },
        });

        return () => {
            if (myChartRef.current) {
                myChartRef.current.destroy(); // Clean up chart on component unmount
            }
        };
    }, [chartData]);

    useImperativeHandle(ref, () => ({
        downloadChart() {
            const link = document.createElement("a");
            link.href = chartRef.current.toDataURL("image/png");
            link.download = "chart.png";
            link.click();
        },
    }));

    return (
        <div className="chart-component-wrapper">
            <canvas ref={chartRef} />
        </div>
    );
});

export default ChartComponent2;
