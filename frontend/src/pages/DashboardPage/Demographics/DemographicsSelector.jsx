import React from "react";

const DemographicsSelector = ({
    demographics,
    selectedDemographic,
    handleDemographicChange,
    selectedValues,
    handleValueChange,
    demographicValues,
    selectedSecondValues,
    secondSelectedDemographic,
    handleSecondDemographicChange,
    secondDemographicValues,
    handleGenerate,
}) => {
    return (
        <div className="select-demographics-2">
            <div className="demog-clas">
                <h2>Demographics</h2>
            </div>
            <div className="select-demographics">
                <div className="title"></div>
                <div className="select-container1">
                    <select
                        onChange={handleDemographicChange}
                        value={selectedDemographic}
                        tabIndex={6}
                    >
                        <option value="">Select</option>
                        {demographics.map((demo, index) => (
                            <option key={index} value={demo}>
                                {demo}
                            </option>
                        ))}
                    </select>

                    {selectedDemographic && (
                        <div className="select-options1">
                            <h3 className="demographic-heading">
                                Values for 1st Demographic
                            </h3>
                            {[...Array(4)].map((_, idx) => (
                                <select
                                tabIndex={7}
                                    key={idx}
                                    onChange={(event) => handleValueChange(event, idx)}
                                    value={selectedValues[idx] || ""}
                                >
                                    <option value="">Select</option>
                                    {demographicValues
                                        .filter((val) => !selectedSecondValues.includes(val))
                                        .map((val, index) => (
                                            <option key={index} value={val}>
                                                {val}
                                            </option>
                                        ))}
                                    
                                </select>
                                
                            ))}
                            
                        </div>
                    )}
                </div>

                {selectedDemographic && (
                    <div className="select-container2">
                        <select
                        tabIndex={8}
                            onChange={handleSecondDemographicChange}
                            value={secondSelectedDemographic}
                        >
                            <option value="">Select</option>
                            {demographics
                                .filter((demo) => demo !== selectedDemographic)
                                .map((demo, index) => (
                                    <option key={index} value={demo}>
                                        {demo}
                                    </option>
                                ))}
                        </select>

                        {secondSelectedDemographic && selectedDemographic && (
                            <div className="select-options2">
                                <h3 className="demographic-heading">
                                    Values for 2nd Demographic
                                </h3>
                                {[...Array(4)].map((_, idx) => (
                                    <select
                                        tabIndex={9}
                                        key={idx}
                                        onChange={(event) =>
                                            handleValueChange(event, idx, true)
                                        }
                                        value={selectedSecondValues[idx] || ""}
                                    >
                                        <option value="">Select</option>
                                        {secondDemographicValues
                                            .filter((val) => !selectedValues.includes(val))
                                            .map((val, index) => (
                                                <option key={index} value={val}>
                                                    {val}
                                                </option>
                                            ))}
                                            
                                    </select>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
            {selectedDemographic && <div className="generate-btn-container">
                <button className="generate-button" onClick={handleGenerate}
                tabIndex={10}>
                    Generate
                </button>
            </div>}
        </div>
    );
};

export default DemographicsSelector;
