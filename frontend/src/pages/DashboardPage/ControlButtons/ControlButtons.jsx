import React, { useRef, useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap CSS
import "./ControlButtons.css";
import { envConfig } from "../../../envConfig.js";
import Swal from "sweetalert2";

const ControlButtons = ({ onDownload }) => {
  const VITE_BACKEND_URL = envConfig;

  const [currUser, setCurrUser] = useState("");
  const [showModal, setShowModal] = useState(false); // Modal visibility state
  const [showModaldataset, setshowModaldataset] = useState(false);

  const fileInputRef1 = useRef(null); // For model import
  const fileInputRef2 = useRef(null); // For dataset import

  const modalRef = useRef(null); // Reference to modal element
  const importModelButtonRef = useRef(null);
  const importDatasetButtonRef = useRef(null);

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
        Swal.fire({
          icon: "error",
          title: "Please log in first",
          text: "You need to log in to access this page.",
          confirmButtonText: "Go to Login",
          timer: 5000,
          timerProgressBar: true,
        }).then(() => {
          window.location.href = "/"; // Redirect to login if no email
        });
      }
    } catch (error) {
      console.error("Error fetching email:", error);

      Swal.fire({
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
    setShowModal(true); // Open the modal when button is clicked
  };

  const handleImportDataset = () => {
    setshowModaldataset(true);
  };

  const handleModelFileChange = async (event) => {
    const file = event.target.files[0];

    if (!file) return; // If no file is selected, exit

    if (!file.name.endsWith(".pkl")) {
      alert("Please upload a model in .pkl format.");
      return;
    }

    const formData = new FormData();
    formData.append("curr_user", currUser);
    formData.append("model_file", file);
    formData.append("dashboard", "secret_token");

    try {
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

    if (!file.name.endsWith(".csv")) {
      alert("Please upload a file in CSV format.");
      return;
    }

    const formData = new FormData();
    formData.append("curr_user", currUser);
    formData.append("csv_to_read", file);

    try {
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
    setShowModal(false);
  };

  const closeModal2 = () => {
    setshowModaldataset(false);
  };

  useEffect(() => {
    if (showModal === false) {
      // Focus on Import Dataset button after closing model modal
      importDatasetButtonRef.current.focus();
    }
  }, [showModal]);

  useEffect(() => {
    if (showModaldataset === false) {
      // Focus on Import Models button after closing dataset modal
      importModelButtonRef.current.focus();
    }
  }, [showModaldataset]);

  // Trap focus inside modal when modal is open
  useEffect(() => {
    if (showModal || showModaldataset) {
      const focusableElements = modalRef.current.querySelectorAll(
        "button, input, select, textarea"
      );
      const firstFocusableElement = focusableElements[0];
      const lastFocusableElement =
        focusableElements[focusableElements.length - 1];

      firstFocusableElement.focus();

      const handleTab = (e) => {
        if (e.key === "Tab") {
          if (e.shiftKey) {
            // Shift + Tab
            if (document.activeElement === firstFocusableElement) {
              lastFocusableElement.focus();
              e.preventDefault();
            }
          } else {
            // Tab
            if (document.activeElement === lastFocusableElement) {
              firstFocusableElement.focus();
              e.preventDefault();
            }
          }
        }
      };

      document.addEventListener("keydown", handleTab);

      return () => {
        document.removeEventListener("keydown", handleTab);
      };
    }
  }, [showModal, showModaldataset]);

  return (
    <div className="file-import-container">
      <input
        type="file"
        ref={fileInputRef1}
        onChange={handleModelFileChange}
        style={{ display: "none" }}
        aria-label="Import model file" // ARIA label for model file input
      />
      <input
        type="file"
        ref={fileInputRef2}
        onChange={handleDatasetFileChange}
        style={{ display: "none" }}
        aria-label="Import dataset file" // ARIA label for dataset file input
      />
      <button
        ref={importModelButtonRef}
        className="upload-model-button"
        onClick={handleImportModels}
        tabIndex={1}
        aria-label="Import Models" // ARIA label for import models button
      >
        Import Models
      </button>
      <button
        ref={importDatasetButtonRef}
        className="upload-dataset-button"
        onClick={handleImportDataset}
        tabIndex={2}
        aria-label="Import Dataset" // ARIA label for import dataset button
      >
        Import Dataset
      </button>
      <button
        onClick={onDownload}
        tabIndex={3}
        aria-label="Download Graph" // ARIA label for download graph button
      >
        Download Graph
      </button>

      {/* Modal for model upload instructions */}
      {showModal && (
        <div
          className="modal show"
          style={{ display: "block", backdropFilter: "blur(5px)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" ref={modalRef}>
              <div className="modal-header">
                <h5 className="modal-title">Model Upload Instructions</h5>
                <button
                  type="button"
                  className="close"
                  style={{
                    backgroundColor: "#45a049",
                    borderColor: "#45a049",
                    fontSize: "0.875rem",
                    padding: "0.25rem 0.5rem",
                    borderRadius: "0.2rem",
                  }}
                  onClick={closeModal}
                  aria-label="Close model upload instructions" // ARIA label for close button in modal
                >
                  &times;
                </button>
              </div>
              <div className="modal-body">
                <p>
                  <strong>File format:</strong> The file must be in{" "}
                  <code>.pkl</code> format.
                </p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => fileInputRef1.current.click()}
                  aria-label="Choose model file" // ARIA label for choosing model file
                >
                  Choose File
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal for dataset upload instructions */}
      {showModaldataset && (
        <div
          className="modal show"
          style={{ display: "block", backdropFilter: "blur(5px)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" ref={modalRef}>
              <div className="modal-header">
                <h5 className="modal-title">Dataset Upload Instructions</h5>
                <button
                  type="button"
                  className="close"
                  style={{
                    backgroundColor: "#45a049",
                    borderColor: "#45a049",
                    fontSize: "0.875rem",
                    padding: "0.25rem 0.5rem",
                    borderRadius: "0.2rem",
                  }}
                  onClick={closeModal2}
                  aria-label="Close dataset upload instructions" // ARIA label for close button in modal
                >
                  &times;
                </button>
              </div>
              <div className="modal-body">
                <p>
                  <strong>File format:</strong> The file must be in{" "}
                  <code>.csv</code> format.
                </p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => fileInputRef2.current.click()}
                  aria-label="Choose dataset file" // ARIA label for choosing dataset file
                >
                  Choose File
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
