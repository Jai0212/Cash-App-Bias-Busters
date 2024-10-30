// src/ControlButtons.jsx
import React, { useRef } from "react";

const ControlButtons = ({ onDownload }) => {
  const fileInputRef1 = useRef(null);
  const fileInputRef2 = useRef(null);

  const handleImportModels = () => {
    fileInputRef1.current.click();
  };

  const handleImportDataset = () => {
    fileInputRef2.current.click();
  };

  const handleFileChange = (event) => {
    // Handle the uploaded file here
    const file = event.target.files[0];
    console.log("File uploaded:", file);
  };

  return (
    <div style={{ marginTop: "20px" }}>
      <input
        type="file"
        ref={fileInputRef1}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
      <input
        type="file"
        ref={fileInputRef2}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
      <button onClick={handleImportModels}>Import Models</button>
      <button onClick={handleImportDataset}>Import Dataset</button>
      <button onClick={onDownload}>Download Graph</button>
    </div>
  );
};

export default ControlButtons;
