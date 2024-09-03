import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import styles from "./LectureScheduleCard.module.css";

const LectureCard = () => {
  const [year, setYear] = useState("");
  const [uploadDate, setUploadDate] = useState("");
  const [jsonData, setJsonData] = useState([]);
  const [popupMessage, setPopupMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [popupTimer, setPopupTimer] = useState(null);

  const levels = ["First Year", "Second Year", "Third Year", "Fourth Year"];

  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  };

  const handleUpload = (event, selectedYear) => {
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

          setYear(selectedYear);
          setUploadDate(uploadDate);
          setJsonData(jsonData);

          const jsonDataString = JSON.stringify(jsonData);
          console.log("JSON Data :", jsonDataString);

          sendPostRequest({
            year: selectedYear,
            uploadDate: uploadDate,
            jsonData: jsonDataString,
          });
        }
      };

      reader.readAsArrayBuffer(file);
    }
  };

  const sendPostRequest = async (data) => {
    try {
      const response = await fetch(
        "http://localhost:5000/schedule/addSchedule",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (response.ok) {
        setPopupMessage("Data was sent successfully!");
      } else {
        setPopupMessage("Failed to send data. Please try again.");
      }
    } catch (error) {
      console.error("Error sending data to server:", error);
      setPopupMessage("An error occurred while sending data.");
    } finally {
      setShowPopup(true);
    }
  };

  const handleInput = (selectedYear) => {
    const fileInput = document.querySelector(
      `input[type="file"][data-year="${selectedYear}"]`
    );
    if (fileInput) {
      fileInput.click();
    }
  };

  const closePopup = () => {
    setShowPopup(false);
    if (popupTimer) {
      clearTimeout(popupTimer);
    }
  };

  useEffect(() => {
    if (showPopup) {
      const timer = setTimeout(() => {
        setShowPopup(false);
      }, 5000);
      setPopupTimer(timer);
    }
    return () => {
      if (popupTimer) {
        clearTimeout(popupTimer);
      }
    };
  }, [showPopup]);

  return (
    <div className={styles.card}>
      <h2 className={styles.header}>Lecture Schedules</h2>
      <ul className={styles.list}>
        {levels.map((level) => (
          <li key={level} className={styles.listItem}>
            <span>{level}</span>
            <input
              type="file"
              accept=".xlsx, .xls"
              data-year={level}
              onChange={(event) => handleUpload(event, level)}
              className={styles.fileInput}
            />
            <button
              className={styles.editButton}
              onClick={() => handleInput(level)}
            >
              Upload
            </button>
          </li>
        ))}
      </ul>

      {showPopup && (
        <div className={styles.popup}>
          <div className={styles.popupContent}>
            <div className={styles.popupIcon}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="40"
                height="40"
                fill="green"
              >
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22c-5.522 0-10-4.478-10-10s4.478-10 10-10 10 4.478 10 10-4.478 10-10 10zm-1-15h2v6h-2zm0 8h2v2h-2z" />
              </svg>
            </div>
            <p className={styles.popupMessage}>{popupMessage}</p>
            <button className={styles.closeButton} onClick={closePopup}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LectureCard;
