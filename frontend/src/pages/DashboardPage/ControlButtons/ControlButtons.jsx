import React, { useRef, useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";  // Import Bootstrap CSS
import "./ControlButtons.css";

const ControlButtons = ({ onDownload }) => {
  const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const [currUser, setCurrUser] = useState("");
  const [showModal, setShowModal] = useState(false); // Modal visibility state

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
    setShowModal(true);  // Open the modal when button is clicked
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

  const closeModal = () => {
    setShowModal(false); // Close the modal
  };

  return (
      <div className="file-import-container">
        <input
            type="file"
            ref={fileInputRef1}
            onChange={handleModelFileChange}
            style={{ display: 'none' }} // Hide the file input
        />
        <input
            type="file"
            ref={fileInputRef2}
            onChange={handleDatasetFileChange}
            style={{ display: 'none' }} // Hide the file input
        />
        <button
            className="upload-model-button"
            onClick={handleImportModels}
            tabIndex={12}
        >
          Import Models
        </button>
        <button
            className="upload-dataset-button"
            onClick={handleImportDataset}
            tabIndex={13}
        >
          Import Dataset
        </button>
        <button
            onClick={onDownload}
            tabIndex={14}
        >
          Download Graph
        </button>

        {/* Bootstrap Modal for model upload instructions */}
        {showModal && (
            <div className="modal show" style={{ display: "block" }}>
              <div className="modal-dialog">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Model Upload Instructions</h5>
                    <button
                        type="button"
                        className="close"
                        style={{
                          backgroundColor: "#45a049",
                          borderColor: "#45a049",
                          fontSize: "0.875rem",  // Smaller font size
                          padding: "0.25rem 0.5rem",  // Smaller padding
                          borderRadius: "0.2rem"  // Optional: round corners slightly
                        }}
                        onClick={closeModal}
                    >
                      &times;
                    </button>
                  </div>
                  <div className="modal-body">
                    <p><strong>File format:</strong> The file must be in <code>.pkl</code> format.</p>
                    <p><strong>File size:</strong> The file size must be less than 1 MB.</p>
                  </div>
                  <div className="modal-footer">
                    <button
                        type="button"
                        className="btn btn-primary"
                        style={{
                          backgroundColor: "#45a049",
                          borderColor: "#45a049",
                          fontSize: "0.875rem",  // Smaller font size
                          padding: "0.25rem 0.5rem",  // Smaller padding
                          borderRadius: "0.2rem"  // Optional: round corners slightly
                        }}
                        onClick={() => {
                          fileInputRef1.current.click();  // Trigger file input inside modal
                          closeModal(); // Close the modal after triggering file input
                        }}
                    >
                      Upload Model
                    </button>
                    <button
                        type="button"
                        className="btn btn-secondary"
                        style={{
                          backgroundColor: "#45a049",
                          borderColor: "#45a049",
                          fontSize: "0.875rem",  // Smaller font size
                          padding: "0.25rem 0.5rem",  // Smaller padding
                          borderRadius: "0.2rem"  // Optional: round corners slightly
                        }}
                        onClick={closeModal}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
        )}


      </div>
  );
};

export default ControlButtons;
