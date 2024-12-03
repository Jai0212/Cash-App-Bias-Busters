import React, { useState } from "react";
import QRCode from "react-qr-code"; // Import from react-qr-code
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap CSS
import "./QRCodeShare.css"; // Import the CSS file for styling
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { envConfigFrontend } from "../../../envConfig";

const QRCodeShare = ({
  selectedDemographic,
  selectedValues,
  selectedSecondValues,
  secondSelectedDemographic,
  timeframe,
  currUser,
}) => {
  const VITE_FRONTEND_URL = envConfigFrontend();

  const [showModal, setShowModal] = useState(false); // Modal visibility state
  const [shareSuccess, setShareSuccess] = useState(null); // State to track success or failure
  const [encodedData, setEncodedData] = useState(null); // State to store the encoded data
  const navigate = useNavigate(); // Hook for programmatic navigation

  const closeModal = () => {
    setShowModal(false); // Close the modal
  };

  const encodeData = (data) => {
    try {
      const jsonData = JSON.stringify(data);
      const encoded = btoa(jsonData); // Base64 encode the string
      return encoded;
    } catch (error) {
      console.error("Error encoding data:", error);
      return null;
    }
  };

  const handleShare = () => {
    setShowModal(true); // Open the modal

    const dataToEncode = {
      selectedDemographic,
      selectedValues,
      selectedSecondValues,
      secondSelectedDemographic,
      timeframe,
      currUser,
    };

    const encoded = encodeData(dataToEncode);

    if (encoded) {
      setEncodedData(encoded); // Store the encoded data
      setShareSuccess(true); // Indicate successful encoding
    } else {
      setShareSuccess(false); // Indicate failure to encode
    }
  };

  const handleNavigate = () => {
    if (encodedData) {
      window.open(`${VITE_FRONTEND_URL}/share/${encodedData}`, "_blank"); // Open in a new tab
    }
  };

  return (
    <div>
      <button className="share-button" onClick={handleShare} tabIndex={21}>
        <svg
          className="icon-share"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          style={{ width: "16px", height: "16px", marginRight: "8px" }}
        >
          <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7a3.248 3.248 0 000-1.39l7.11-4.11c.53.5 1.21.8 1.96.8 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .16.03.31.05.47L8.03 9.65c-.54-.51-1.25-.85-2.03-.85-1.66 0-3 1.34-3 3s1.34 3 3 3c.78 0 1.49-.34 2.03-.85l6.08 3.51c-.02.16-.05.31-.05.47 0 1.66 1.34 3 3 3s3-1.34 3-3-1.34-3-3-3z" />
        </svg>
        Share
      </button>

      {showModal && (
        <div
          className="modal show"
          style={{
            display: "block",
            backdropFilter: "blur(5px)",
            marginBottom: "-10px",
          }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Share Dashboard</h5>
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
                    marginTop: "1.3rem",
                  }}
                  onClick={closeModal}
                >
                  &times;
                </button>
              </div>
              <div className="modal-body">
                <p>
                  <strong>Scan the QR code to view detailed data:</strong>
                </p>
                <div style={{ textAlign: "center" }}>
                  {encodedData && (
                    <>
                      <QRCode
                        value={`${VITE_FRONTEND_URL}/share/${encodedData}`}
                        size={256}
                      />
                      <p
                        style={{
                          marginTop: "10px",
                          textDecoration: "underline",
                          cursor: "pointer",
                          color: "#007bff",
                        }}
                        onClick={handleNavigate}
                      >
                        Link
                      </p>
                    </>
                  )}
                </div>
                {shareSuccess !== null && (
                  <div className="mt-3" style={{ textAlign: "center" }}>
                    {shareSuccess ? (
                      <p style={{ color: "green" }}></p>
                    ) : (
                      <p style={{ color: "red" }}>
                        Failed to share data. Please try again.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRCodeShare;
