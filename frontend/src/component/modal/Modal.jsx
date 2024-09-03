"use client";
import React, { useState, useRef, useEffect } from "react";
import * as XLSX from "xlsx";
import styles from "./Modal.module.css";
import { IoCloseSharp } from "react-icons/io5";

const professors = {
  CS: ["Dr. Ahmed Hosny", "Dr. Khaled Fathy"],
  IS: ["Dr. Ibrahim Al-Awadhi", "Dr. Suha"],
  IT: ["Dr. Nagwa"],
};

const Modal = ({ isOpen, onClose }) => {
  const [selectedProfessor, setSelectedProfessor] = useState("");
  const [jsonData, setJsonData] = useState([]);
  const [uploadDate, setUploadDate] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [fileContent, setFileContent] = useState(null);
  const [popupMessage, setPopupMessage] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const fileInputRef = useRef(null);

  // Ensure the modal is closed if `isOpen` becomes false
  useEffect(() => {
    if (!isOpen) {
      setShowPopup(false); // Close any open popup if the modal is not open
    }
  }, [isOpen]);

  // Handle file input change
  const handleFileInputChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target?.result;
        if (data) {
          const uploadDate = formatDate(new Date());
          const arrayBuffer = data;
          const workbook = XLSX.read(new Uint8Array(arrayBuffer), {
            type: "array",
          });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          setJsonData(jsonData);
          setUploadDate(uploadDate);
          setFileContent({
            selectedProfessor,
            uploadDate,
            jsonData: JSON.stringify(jsonData),
          });
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  // Format date to string
  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  };

  // Handle category change
  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
    setSelectedProfessor("");
  };

  // Handle professor change
  const handleProfessorChange = (event) => {
    setSelectedProfessor(event.target.value);
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!fileContent) {
      setPopupMessage("No file content to upload.");
      setShowPopup(true);
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/professorAvailability/add",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(fileContent),
        }
      );

      if (response.ok) {
        setPopupMessage("Data uploaded successfully.");
      } else {
        setPopupMessage("Failed to upload data.");
      }
    } catch (error) {
      console.error("Error sending data to server:", error);
      setPopupMessage("Error sending data to server.");
    } finally {
      setShowPopup(true);
    }
  };

  // Handle file input click
  const handleFileInputClick = () => {
    fileInputRef.current?.click();
  };

  // Close popup after a delay
  useEffect(() => {
    if (showPopup) {
      const timer = setTimeout(() => {
        setShowPopup(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showPopup]);

  // Do not render anything if the modal is not open
  if (!isOpen) return null;

  return (
    <div
      className={styles.overlay}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={styles.modal}>
        <button className={styles.close} onClick={onClose}>
          <IoCloseSharp />
        </button>
        <h2 className={styles.title}>Professor Availability</h2>
        <div className={styles.content}>
          <div className={styles.formGroup}>
            <label htmlFor="category" className={styles.label}>
              Select Department
            </label>
            <select
              id="category"
              value={selectedCategory}
              onChange={handleCategoryChange}
              className={styles.select}
            >
              <option value="">Select</option>
              <option value="CS">Computer Science</option>
              <option value="IS">Information System</option>
              <option value="IT">Information Technology</option>
            </select>
          </div>
          {selectedCategory && (
            <div className={styles.formGroup}>
              <label htmlFor="professor" className={styles.label}>
                Select Professor
              </label>
              <select
                id="professor"
                value={selectedProfessor}
                onChange={handleProfessorChange}
                className={styles.select}
              >
                <option value="">Select</option>
                {professors[selectedCategory].map((professor) => (
                  <option key={professor} value={professor}>
                    {professor}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className={styles.uploadSection}>
            <button
              className={styles.fileButton}
              onClick={handleFileInputClick}
            >
              Choose File
            </button>
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileInputChange}
              ref={fileInputRef}
              className={styles.fileInput}
            />
            <button className={styles.uploadButton} onClick={handleUpload}>
              Upload
            </button>
          </div>
        </div>
      </div>
      {showPopup && (
        <div className={styles.popup}>
          <div className={styles.popupContent}>
            <div className={styles.popupIcon}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="40"
                height="40"
                fill={popupMessage?.includes("success") ? "green" : "red"}
              >
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22c-5.522 0-10-4.478-10-10s4.478-10 10-10 10 4.478 10 10-4.478 10-10 10zm-1-15h2v6h-2zm0 8h2v2h-2z" />
              </svg>
            </div>
            <p className={styles.popupMessage}>{popupMessage}</p>
            <button
              className={styles.closeButton}
              onClick={() => setShowPopup(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Modal;
