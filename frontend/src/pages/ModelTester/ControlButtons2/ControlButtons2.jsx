import React, { useRef, useState, useEffect } from "react";
import "./ControlButtons2.css";

const ControlButton2 = ({ setUploadedFiles }) => {
    const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

    const [currUser, setCurrUser] = useState(""); // Store current user's email
    const [uploadedFiles, setUploadedFilesState] = useState([]); // Local state for uploaded files
    const fileInputRef = useRef(null); // For model import

    // Fetch email for the current user
    const fetchEmailAndDemographics = async () => {
        const url = `${VITE_BACKEND_URL}/get-email`;

        try {
            const emailResponse = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const emailData = await emailResponse.json();
            console.log(emailData);

            if (emailData && emailData.email) {
                setCurrUser(emailData.email); // Set the user email if it exists
            } else {
                setCurrUser("");

                swal.fire({
                    icon: "error",
                    title: "Please log in first",
                    text: "You need to log in to access this page.",
                    confirmButtonText: "Go to Login",
                    timer: 5000,
                    timerProgressBar: true,
                }).then(() => {
                    window.location.href = "/";
                });
            }
        } catch (error) {
            console.error("Error fetching email:", error);

            // If there is any error fetching email, show the same alert
            swal.fire({
                icon: "error",
                title: "Error",
                text: "An error occurred while fetching your email. Please try again later.",
            });
        }
    };

    useEffect(() => {
        fetchEmailAndDemographics();

        // Load the uploaded files from localStorage when the component mounts
        const storedFiles = JSON.parse(localStorage.getItem("uploadedFiles"));
        if (storedFiles) {
            setUploadedFilesState(storedFiles);
        }
    }, []);

    const handleModelUploadClick = () => {
        fileInputRef.current.click(); // Trigger model file input
    };

    const handleModelFileChange = async (event) => {
        const files = event.target.files;

        if (!files.length) return; // If no files are selected, exit

        if (uploadedFiles.length === 5) {
            alert("You can only upload 5 models at a time.");
            return;
        }

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

            if (uploadedFiles.includes(file.name)) {
                alert(`File with name ${file.name} already uploaded.`);
                continue;
            }

            if (file.name === "model.pkl") {
                alert("You cannot upload a file named model.pkl.");
                continue;
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

                // Save the new list to localStorage
                localStorage.setItem("uploadedFiles", JSON.stringify(newUploadedFiles));

                // Reset the file input after uploading
                event.target.value = null;

            } catch (error) {
                console.error("Error during model upload:", error);
                alert("Error during model upload: " + error.message);
            }
        }
    };

    const handleDeleteFile = (index) => {
        const fileName = uploadedFiles[index];

        // Remove the file from the local state
        const updatedFiles = uploadedFiles.filter((_, i) => i !== index);

        setUploadedFiles(updatedFiles);
        setUploadedFilesState(updatedFiles); // Update local state as well

        // Save the updated list to localStorage
        localStorage.setItem("uploadedFiles", JSON.stringify(updatedFiles));

        // Optionally, delete the file from the server
        const deleteFile = async () => {
            try {
                const response = await fetch(`${VITE_BACKEND_URL}/api/delete-model`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ curr_user: currUser, file_name: fileName }),
                });

                if (!response.ok) {
                    throw new Error('Error deleting file');
                }
                console.log(`Successfully deleted ${fileName}`);
            } catch (error) {
                console.error('Error during file deletion:', error);
            }
        };

        deleteFile();
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
            {uploadedFiles.length > 0 && (
                <div className="uploaded-files-list">
                    <ul>
                        {uploadedFiles.map((fileName, index) => (
                            <li key={index} className="uploaded-file-item">
                                <span role="img" aria-label="file-icon" className="file-icon">📂</span>
                                <span className="file-name">{fileName}</span>
                                <button
                                    className="delete-file-btn"
                                    onClick={() => handleDeleteFile(index)} // Handle file deletion
                                >
                                    ❌
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default ControlButton2;
