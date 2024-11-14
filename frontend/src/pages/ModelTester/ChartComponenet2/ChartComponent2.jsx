import React, { useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import Chart from "chart.js/auto";
import './ChartComponent2.css';

const ChartComponent2 = forwardRef(({ chartData }, ref) => {
    const chartRef = useRef(null);
    const myChartRef = useRef(null);

    useEffect(() => {
        if (!chartData) return;

        const labels = chartData.labels || []; // Expect labels to be passed in chartData as an array of "Model 1", "Model 2", ...

        const datasets = [
            {
                label: "Generated Data", // Label for the dataset
                data: chartData.datasets?.[0]?.data || [], // Data values corresponding to the models
                backgroundColor: labels.map((_, index) => `rgba(${index * 40}, ${100 + index * 40}, ${150 - index * 30}, 0.6)`), // Dynamic color for each bar
            },
        ];

        const data = {
            labels: labels, // Use the dynamic model labels here
            datasets: datasets,
        };

        const ctx = chartRef.current.getContext("2d");

        if (myChartRef.current) {
            myChartRef.current.destroy(); // Destroy previous chart instance if it exists
        }

        // Initialize the chart with a bar graph
        myChartRef.current = new Chart(ctx, {
            type: "bar", // Bar chart type
            data: data,
            options: {
                scales: {
                    x: {
                        ticks: {
                            autoSkip: false, // Ensure all x-axis labels are shown
                        },
                    },
                    y: {
                        min: 0,
                        max: 1,
                        beginAtZero: true, // Ensure y-axis starts at zero
                    },
                },
            },
        });

        return () => {
            if (myChartRef.current) {
                myChartRef.current.destroy(); // Cleanup on component unmount
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
        <div className="chart-container">
            <canvas ref={chartRef} />
        </div>
    );
});

export default ChartComponent2;