import React, { useState, useRef, useEffect } from 'react';
import ChartComponent from '../ChartComponenet/ChartComponent.jsx';
import "./Slider.css"

const Slider = ({ graphData, maxValue }) => {
    const [sliderValue, setSliderValue] = useState(0.5);
    const chartRef = useRef(null);

    const handleSliderChange = (event) => {
        setSliderValue(parseFloat(event.target.value));
        console.log('Slider Value:', event.target.value); // For debugging
        updateSliderStyle(event.target, event.target.value);
    };

    const updateSliderStyle = (slider, value) => {
        let color;
        if (value <= 0.3) {
            color = "green";
        } else if (value > 0.3 && value <= 0.66) {
            color = "yellow";
        } else {
            color = "red";
        }

        slider.style.background = `linear-gradient(to right, ${color} ${value * 100}%, white ${value * 100}%)`;
    };

    useEffect(() => {
        if (document.activeElement && document.activeElement.className == "slider-input") {
            document.activeElement.classList.add("slider-input-ring");
        } else if (document.activeElement && document.activeElement.className != "slider-input") {
            document.activeElement.classList.remove("slider-input-ring");
        }
    }, [document.activeElement])

    return (
        <div>
            <div className="slider-container">
            <label className="slider-label-cont" for="threshold">
                BIAS THRESHOLD: <span className="slider-value">{Math.round(sliderValue * 100)}%</span>
            </label>
            <input
                id="threshold"
                className="slider-input"
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={sliderValue}
                onChange={handleSliderChange}
                tabIndex={15}
            />
            </div>
            <div>
                {Object.keys(graphData).length > 0 && (
                    <ChartComponent
                        ref={chartRef}
                        chartData={graphData}
                        sliderValue={sliderValue}
                        bias={maxValue()}
                    />
                )}
            </div>
        </div>
    );
};


export default Slider;
