import React, { useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import Chart from "chart.js/auto";
import './ChartComponent2.css';

const ChartComponent2 = forwardRef(({ chartData, generationalResults }, ref) => {
    const chartRef = useRef(null);
    const myChartRef = useRef(null);
    const staticColors = [
        '#008585',     // Bright yellow
        '#c7522a',   // Light yellow
        '#893f71',    // Lemon yellow
        '#ffa600',     // Golden yellow
    ];

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
            data: {
                ...chartData,
                datasets: chartData.datasets.map((dataset, index) => ({
                    ...dataset,
                    backgroundColor: staticColors.slice(0, dataset.data.length), // Apply static colors to each bar
                }))
            },
            options: {
                scales: {
                    x: {
                        ticks: {
                            color: "#007CFF", // Set x-axis labels to white
                            autoSkip: false, // Ensure all x-axis labels are shown
                            padding: 15, // Add padding between x-axis labels and axis
                        },
                        grid: {
                            color: "rgba(0, 124, 255, 0.5)",
                        },
                        title: {
                            display: true,   // Show the title
                            color: "#007CFF", // Set x-axis title color to white
                            text: 'Model Name', // Set the x-axis title
                            font: {
                                size: 15,   // Increase the font size
                                weight: 'bold',
                            },
                        },
                    },
                    y: {
                        min: 0,
                        max: 1,
                        beginAtZero: true, // Ensure y-axis starts at zero
                        ticks: {
                            color: "#007CFF", // Set y-axis labels to white
                            padding: 15, // Add padding between x-axis labels and axis
                            font: {
                                size: 12,
                            },
                        }, // <-- This closing bracket for ticks was missing
                        grid: {
                            color: "rgba(0, 124, 255, 0.5)", // Set y-axis grid lines to translucent white
                        },
                        title: {
                            display: true,   // Show the title
                            text: 'Bias',     // Set the y-axis title
                            color: "#007CFF", // Set y-axis title color to white
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
                    legend: {
                        display: false
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
        <div className="chart-component-wrapper">
            <div className="chart-container">
                <canvas className="chart-2-canvas" ref={chartRef}/>
            </div>
        </div>
    );
});

export default ChartComponent2;
