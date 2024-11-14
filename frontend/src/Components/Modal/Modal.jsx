import React from 'react';

const Modal = ({ closeModal }) => {
    const handleClose = (e) => {
        e.preventDefault(); // Prevent any default behavior (like form submission)
        closeModal();// Close the modal
    };

    return (
        <div className="modal">
            <div className="modal-content">
                <span className="close" onClick={handleClose}>&times;</span>
                <h2>Fairlearn & Performance Metrics</h2>
                <p>In the context of model evaluation, <strong>accuracy</strong> and the rates of <strong>false
                    positives</strong> and <strong>false negatives</strong> are essential metrics for understanding the
                    performance of a model:</p>

                <ul>
                    <li><strong>Accuracy</strong>: This is the proportion of correct predictions (both true positives
                        and true negatives) to the total predictions. It is defined as:
                    </li>
                    <pre><code>Accuracy = (True Positives + True Negatives) / Total Predictions</code></pre>

                    <li><strong>False Positive Rate (FPR)</strong>: This is the proportion of negative instances that
                        are incorrectly classified as positive. A high FPR means the model is incorrectly identifying
                        too many negative instances as positive.
                    </li>
                    <pre><code>False Positive Rate = False Positives / (False Positives + True Negatives)</code></pre>

                    <li><strong>False Negative Rate (FNR)</strong>: This is the proportion of positive instances that
                        are incorrectly classified as negative. A high FNR indicates that the model is missing a
                        significant number of actual positive instances.
                    </li>
                    <pre><code>False Negative Rate = False Negatives / (False Negatives + True Positives)</code></pre>
                </ul>

                <p>These metrics are critical for evaluating a model's fairness, as biases in these rates can
                    disproportionately affect certain demographic groups. By using Fairlearn, you can ensure your model
                    is both accurate and fair across various groups.</p>
            </div>
        </div>
    );
};

export default Modal;
