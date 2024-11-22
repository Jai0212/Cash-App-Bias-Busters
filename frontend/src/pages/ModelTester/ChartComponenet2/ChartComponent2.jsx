import React, { useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import Chart from "chart.js/auto";
import './ChartComponent2.css';

const ChartComponent2 = forwardRef(({ chartData, generationalResults }, ref) => {
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
                        title: {
                            display: true,   // Show the title
                            text: 'Model Name', // Set the x-axis title
                            font: {
                                size: 15,   // Increase the font size
                                weight: 'bold',
                            },
                        }
                    },
                    y: {
                        min: 0,
                        max: 1,
                        beginAtZero: true, // Ensure y-axis starts at zero
                        title: {
                            display: true,   // Show the title
                            text: 'Bias',     // Set the y-axis title
                            font: {
                                size: 15,   // Increase the font size
                                weight: 'bold', // Make the text bold
                            },
                        },
                    },
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: (tooltipItem) => {
                                const index = tooltipItem.dataIndex; // Get the index of the hovered bar

                                // Access the generational result for the hovered bar
                                const generationalResult = generationalResults[index];

                                // Build the custom tooltip content using generationalResults data
                                return [
                                    `Bias: ${tooltipItem.raw}`, // Bias value of the hovered bar
                                    `Race: ${generationalResult.race}`,
                                    `Gender: ${generationalResult.gender}`,
                                    `Age: ${generationalResult.age_groups}`,
                                    `State: ${generationalResult.state}`,
                                    `Variance: ${generationalResult.variance}`,
                                ];
                            },
                        },
                    },
                },
            },
        });

        return () => {
            if (myChartRef.current) {
                myChartRef.current.destroy(); // Cleanup on component unmount
            }
        };
    }, [chartData, generationalResults]);

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
