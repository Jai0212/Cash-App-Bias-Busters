import React, { useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import Chart from "chart.js/auto";
import './ChartComponent2.css';

const ChartComponent2 = forwardRef(({ chartData }, ref) => {
    const chartRef = useRef(null);
    const myChartRef = useRef(null);

    console.log("ChartData Model Tester", chartData);

    useEffect(() => {
        if (!chartData) return;

        const ctx = chartRef.current.getContext("2d");

        if (myChartRef.current) {
            myChartRef.current.destroy(); // Destroy previous chart instance if it exists
        }

        // Initialize the chart with a bar graph
        myChartRef.current = new Chart(ctx, {
            type: "bar", // Bar chart type
            data: chartData,
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