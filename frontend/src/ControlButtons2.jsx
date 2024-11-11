import React, { useRef, useState, useEffect } from "react";
import "./ControlButtons2.css";

const ControlButton2 = ({ setUploadedFiles }) => {
    const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

    const [currUser, setCurrUser] = useState(""); // Store current user's email
    const [uploadedFiles, setUploadedFilesState] = useState([]); // Local state for uploaded files
    const fileInputRef = useRef(null); // For model import

    // Fetch email for the current user
    const fetchEmailAndDemographics = async () => {
        const url = "http://localhost:11355/api/get-email"; // Your email fetching URL
        const token = localStorage.getItem('token'); // Token from local storage

        try {
            const emailResponse = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });

            const emailData = await emailResponse.json();
            setCurrUser(emailData.email || "");

        } catch (error) {
            console.error("Error fetching email:", error);
        }
    };

    useEffect(() => {
        fetchEmailAndDemographics();
    }, []);

    const handleModelUploadClick = () => {
        fileInputRef.current.click(); // Trigger model file input
    };

    const handleModelFileChange = async (event) => {
        const files = event.target.files;

        if (!files.length) return; // If no files are selected, exit

        // Create a new array to hold the uploaded files and append the new ones
        const newUploadedFiles = [...uploadedFiles];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (!file.name.endsWith(".pkl")) {
                alert("Please upload a model in .pkl format.");
                return;
            }

            if (!currUser || !file) {
                alert("Error: Missing required data.");
                return;
            }

            const formData = new FormData();
            formData.append("curr_user", currUser);
            formData.append("model_file", file);
            formData.append("dashboard", file.name);

            try {
                // Make a POST request to upload model
                const response = await fetch(`${VITE_BACKEND_URL}/api/upload-model`, {
                    method: "POST",
                    body: formData,
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error("Upload failed:", errorData.error);
                    alert("Error uploading model: " + errorData.error);
                    return;
                }

                const responseData = await response.json();
                console.log("Success:", responseData.message);
                alert("Model uploaded successfully!");

                // Add the file to the list of uploaded files
                newUploadedFiles.push(file.name);

                // Update the state with the new list of uploaded files
                setUploadedFiles(newUploadedFiles);
                setUploadedFilesState(newUploadedFiles); // Update local state

                // Reset the file input after uploading
                event.target.value = null;

            } catch (error) {
                console.error("Error during model upload:", error);
                alert("Error during model upload: " + error.message);
            }
        }
    };

    return (
        <div className="upload-model-container">
            {/* Invisible file input for model */}
            <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                multiple // Allow multiple files
                onChange={handleModelFileChange}
            />

            {/* Button for importing models */}
            <button className="upload-button" onClick={handleModelUploadClick}>Upload Model(s)</button>

            {/* Display the uploaded files below */}
            {uploadedFiles.length > 0 && <div className="uploaded-files-list">
                {uploadedFiles.length > 0 && (
                    <ul>
                        {uploadedFiles.map((fileName, index) => (
                            <li key={index}>
                                <span role="img" aria-label="file-icon">📂</span> {fileName}
                            </li>
                        ))}
                    </ul>
                )}
            </div>}
        </div>
    );
};

export default ControlButton2;
