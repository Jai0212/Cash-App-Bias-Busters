import React, { useRef, useState, useEffect } from "react";
import "./ControlButtons2.css";
import { envConfig } from "../../../envConfig";
import Swal from "sweetalert2";

const ControlButton2 = ({ setUploadedFiles }) => {
  const VITE_BACKEND_URL = envConfig();

  const [currUser, setCurrUser] = useState(""); // Store current user's email
  const [uploadedFiles, setUploadedFilesState] = useState([]); // Local state for uploaded files
  const [showModal, setShowModal] = useState(false); // Modal visibility state
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

        Swal.fire({
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
      Swal.fire({
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
    setShowModal(true);
    // Trigger model file input
  };

  const closeModal = () => {
    setShowModal(false); // Close the modal
  };

  const handleModelFileChange = async (event) => {
    const files = event.target.files;

    if (!files.length) return; // If no files are selected, exit

    if (uploadedFiles.length === 4 || uploadedFiles.length + files.length > 4) {
      alert("You can only upload 4 models.");
      return;
    }

    // Create a new array to hold the uploaded files and append the new ones
    const newUploadedFiles = [...uploadedFiles];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (!currUser || !file) {
        alert("Error: Missing required data.");
        return;
      }

      if (!file.name.endsWith(".pkl")) {
        alert("Please upload a model in .pkl format.");
        return;
      }

      if (newUploadedFiles.includes(file.name)) {
        alert(`File with name ${file.name} already uploaded.`);
        return;
      }

      if (file.name === "model.pkl") {
        alert("You cannot upload a file named model.pkl.");
        return;
      }

      newUploadedFiles.push(file.name);
    }

    // Prepare for the file upload
    const uploadedFilesToPush = [...uploadedFiles];

    try {
      // Make a POST request to upload models
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append("curr_user", currUser);
        formData.append("model_file", file);
        formData.append("dashboard", file.name);

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

        uploadedFilesToPush.push(file.name); // Add to local list of uploaded files
      });

      // Wait for all files to be uploaded
      await Promise.all(uploadPromises);

      // Update the state with the new list of uploaded files
      setUploadedFiles(uploadedFilesToPush);
      setUploadedFilesState(uploadedFilesToPush); // Update local state

      // Save the new list to localStorage
      localStorage.setItem(
        "uploadedFiles",
        JSON.stringify(uploadedFilesToPush)
      );

      // Reset the file input after uploading
      event.target.value = null;

      alert("Model(s) uploaded successfully!");
    } catch (error) {
      console.error("Error during model upload:", error);
      alert("Error during model upload: " + error.message);
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
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ curr_user: currUser, file_name: fileName }),
        });

        if (!response.ok) {
          throw new Error("Error deleting file");
        }
        console.log(`Successfully deleted ${fileName}`);
      } catch (error) {
        console.error("Error during file deletion:", error);
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
        data-testid="file-input"
      />

      {/* Button for importing models */}

      {uploadedFiles.length === 0 && (
        <button className="upload-button-pre" onClick={handleModelUploadClick}>
          Upload Models
        </button>
      )}

      {/* Display the uploaded files below */}
      {uploadedFiles.length > 0 && (
        <div className="uploaded-files-grid">
          {uploadedFiles.map((fileName, index) => (
            <div key={index} className="uploaded-file-box">
              <span role="img" aria-label="file-icon" className="file-icon">
                📂
              </span>
              <span className="file-name">{fileName}</span>
              <button
                className="delete-file-btn"
                onClick={() => handleDeleteFile(index)} // Handle file deletion
              >
                ❌
              </button>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div
          className="modal show"
          style={{ display: "block", backdropFilter: "blur(5px)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
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
                    color: "#fff",
                  }}
                  onClick={closeModal}
                >
                  &times;
                </button>
              </div>
              <div className="modal-body">
                <p>
                  <strong>File format:</strong> The file must be in{" "}
                  <code>.pkl</code> format. Note that the system supports{" "}
                  <code>DecisionTreeClassfier </code> models. Make sure the
                  dataset has enough rows for test split chosen!
                </p>

                <p>
                  <strong>Important:</strong> The model name should not be{" "}
                  <code>model.pkl</code>. Avoid uploading models with the same
                  name as existing ones to prevent conflicts.
                </p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{
                    backgroundColor: "#45a049",
                    borderColor: "#45a049",
                    fontSize: "0.875rem",
                    padding: "0.25rem 0.5rem",
                    borderRadius: "0.2rem",
                  }}
                  onClick={() => {
                    fileInputRef.current.click(); // Trigger file input inside modal
                    closeModal(); // Close the modal after triggering file input
                  }}
                >
                  Upload Model(s)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ControlButton2;
