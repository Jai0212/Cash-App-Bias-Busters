import React, { useRef, useState, useEffect } from "react";
import "./ControlButtons.css";

const ControlButton2 = ({ onModelUpload }) => {
    const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

    const [currUser, setCurrUser] = useState(""); // Store current user's email
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
        const file = event.target.files[0];

        if (!file) return; // If no file is selected, exit

        if (!file.name.endsWith(".pkl")) {
            alert("Please upload a model in .pkl format.");
            return;
        }

        // Create FormData object
        const formData = new FormData();
        formData.append("curr_user", currUser);
        formData.append("model_file", file); // Use model_file for model uploads

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

            // You can handle other logic here after a successful upload
        } catch (error) {
            console.error("Error during model upload:", error);
            alert("Error during model upload: " + error.message);
        }
    };

    return (
        <div className="file-import-container">
            {/* Invisible file input for model */}
            <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleModelFileChange}
            />

            {/* Button for importing models */}
            <button onClick={handleModelUploadClick}>Upload Model</button>
        </div>
    );
};

export default ControlButton2;
