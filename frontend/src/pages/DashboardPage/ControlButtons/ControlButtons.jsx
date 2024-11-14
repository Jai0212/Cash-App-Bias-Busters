// src/ControlButtons.jsx
import React, { useRef, useState, useEffect } from "react";
import "./ControlButtons.css";

const ControlButtons = ({ onDownload }) => {
  const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const [currUser, setCurrUser] = useState("");

  const fileInputRef1 = useRef(null); // For model import
  const fileInputRef2 = useRef(null); // For dataset import

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
      <button onClick={handleImportModels} tabIndex={12}>Import Models</button>
      <button onClick={handleImportDataset} tabIndex={13}>Import Dataset</button>
      <button onClick={onDownload} tabIndex={14}>Download Graph</button>
    </div>

  );
};

export default ControlButtons;
