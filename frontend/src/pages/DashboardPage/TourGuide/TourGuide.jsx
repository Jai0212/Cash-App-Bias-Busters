import React, { useState } from 'react';
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
            content: 'Select a primary demographic category, such as race, gender, or age, from the dropdown.',
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
            content: 'Adjust the slider to set the desired value between zero and one.',
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

    // Function to speak the content of the current step
    // const speak = (text) => {
    //     const synth = window.speechSynthesis;
    //     synth.cancel(); // Stop any ongoing speech
    //     const utterance = new SpeechSynthesisUtterance(text);
    //     utterance.rate = 1; // Adjust the rate if needed
    //     synth.speak(utterance);
    // };
    //
    // // Callback to handle Joyride step changes
    // const handleTourCallback = (data) => {
    //     const { action, step } = data;
    //
    //     console.log('Joyride Callback:', data); // Debugging log
    //
    //     if (['start', 'next', 'prev'].includes(action)) {
    //         speak(step.content); // Speak the current step content
    //     }
    //
    //     if (['close', 'skip', 'last', 'stop'].includes(action)) {
    //         window.speechSynthesis.cancel(); // Stop voice feedback
    //     }
    // };

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
            // callback={handleTourCallback}
        />
    );
};

export default TourGuide;
