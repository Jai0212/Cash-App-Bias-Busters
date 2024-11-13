// src/ControlButtons.jsx
import React, { useRef, useState, useEffect } from "react";
import "./ControlButtons.css";

const ControlButtons = ({ onDownload }) => {
  const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const [currUser, setCurrUser] = useState("");

  const fileInputRef1 = useRef(null); // For model import
  const fileInputRef2 = useRef(null); // For dataset import

  const fetchEmailAndDemographics = async () => {
    const url = "http://localhost:11355/api/get-email"; // Your email fetching URL
    const token = localStorage.getItem('token'); // Token from local storage

    try {
      const emailResponse = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token,
        },
      });

      const emailData = await emailResponse.json();

      setCurrUser(emailData || "");

    } catch (error) {
      console.error("Error fetching email:", error);
    }
  };

  useEffect(() => {
    fetchEmailAndDemographics();
  }, []);

  const handleImportModels = () => {
    fileInputRef1.current.click();
  };

  const handleImportDataset = () => {
    fileInputRef2.current.click();
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
    formData.append("model_file", file);
    formData.append("dashboard", "secret_token");

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
    } catch (error) {
      console.error("Error during model upload:", error);
      alert("Error during model upload: " + error.message);
    }
  };

  const handleDatasetFileChange = async (event) => {
    const file = event.target.files[0];

    if (!file) return; // If no file is selected, exit

    // Check if the file format is CSV
    if (!file.name.endsWith(".csv")) {
      alert("Please upload a file in CSV format.");
      return;
    }

    // Create FormData object
    const formData = new FormData();
    formData.append("curr_user", currUser);
    formData.append("csv_to_read", file); // Use csv_to_read for dataset uploads

    try {
      // Make a POST request to upload dataset
      const response = await fetch(`${VITE_BACKEND_URL}/api/upload-data`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Upload failed:", errorData.error);
        alert("Error uploading data: " + errorData.error);
        return;
      }

      const responseData = await response.json();
      console.log("Success:", responseData.message);
      alert("Data uploaded successfully!");
    } catch (error) {
      console.error("Error during dataset upload:", error);
      alert("Error during dataset upload: " + error.message);
    }
  };


  return (
    <div className="file-import-container">
      <input
        type="file"
        ref={fileInputRef1}
        onChange={handleModelFileChange}
      />
      <input
        type="file"
        ref={fileInputRef2}
        onChange={handleDatasetFileChange}
      />
      <button onClick={handleImportModels}>Import Models</button>
      <button onClick={handleImportDataset}>Import Dataset</button>
      <button onClick={onDownload}>Download Graph</button>
    </div>

  );
};

export default ControlButtons;
