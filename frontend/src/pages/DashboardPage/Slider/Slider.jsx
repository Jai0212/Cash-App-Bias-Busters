import React, { useState, useRef } from 'react';
import ChartComponent from '../ChartComponenet/ChartComponent.jsx';

const Slider = ({ graphData, maxValue }) => {
    const [sliderValue, setSliderValue] = useState(0.5);
    const chartRef = useRef(null);

    const handleSliderChange = (event) => {
        setSliderValue(parseFloat(event.target.value));
        console.log('Slider Value:', event.target.value); // For debugging
    };

    return (
        <div>
            <div className="slider-container">
                <label className="slider-label-cont">
                    Adjust the slider (0 to 1): <span className="slider-value">{sliderValue}</span>
                </label>
                <input
                    className="slider-input"
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={sliderValue}
                    onChange={handleSliderChange}
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
