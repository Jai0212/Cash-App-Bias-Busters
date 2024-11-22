import React, { useEffect, useState } from 'react';
import Joyride from 'react-joyride';

const TourGuide = ({ runTour }) => {
    const [steps, setSteps] = useState([
        {
            target: '.upload-model-button',
            content: 'Click here to upload the model file you want to use for analysis.',
            placement: 'bottom',
        },
        {
            target: '.upload-dataset-button',
            content: 'Click here to upload the dataset file for processing.',
            placement: 'bottom',
        },
        {
            target: '.select-container1',
            content: 'Select a primary demographic category (e.g., race, gender, age) from the dropdown.',
            placement: 'bottom',
        },
        {
            target: '.select-options1',
            content: 'Choose values for the first demographic category.',
            placement: 'bottom',
        },
        {
            target: '.select-container2',
            content: 'Now, select a second demographic category for deeper segmentation.',
            placement: 'bottom',
        },
        {
            target: '.select-options2',
            content: 'Choose values for the second demographic category.',
            placement: 'bottom',
        },
        {
            target: '.slider-input',
            content: 'Adjust the slider to set the desired value between 0 and 1.',
            placement: 'top',
        },
        {
            target: '.timeframe-buttons',
            content: 'Select the timeframe you want to see.',
            placement: 'top',
        },
        {
            target: '.generate-button',
            content: 'Click the "Generate" button to generate the graph showing insights across the selected demographics.',
            placement: 'top',
        },
    ]);

    return (
        <Joyride
            steps={steps}
            run={runTour}
            continuous
            showSkipButton
            styles={{
                options: {
                    zIndex: 1000,
                },
            }}
        />
    );
};

export default TourGuide;