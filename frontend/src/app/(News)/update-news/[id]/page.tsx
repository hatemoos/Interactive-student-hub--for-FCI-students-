"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import styles from "../updateNewsPage.module.css";
import Footer from "../../../../app/admin/footer"
export default function UpdateNewsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const fetchData = async () => {
        try {
          const response = await fetch(`http://localhost:5000/news/get?id=${id}`);
          const result = await response.json();
          if (result) {
            setTitle(result.title);
            setDescription(result.description);
            if (result.image) { 
              setExistingImageUrl(result.image);
            }
          }
        } catch (error) {
          console.error("Error fetching news data:", error);
          setError("Failed to load news data.");
        }
      };
      fetchData();
    }
  }, [id]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
      setFileUrl(URL.createObjectURL(event.target.files[0]));
    }
  };

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
  };

  const handleDescriptionChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setDescription(event.target.value);
  };

  const handleUpdate = async () => {
    if (!id) {
      console.error("News ID is required to update");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);

    if (file) {
      formData.append("image", file);
    }

    try {
      const response = await fetch(
        `http://localhost:5000/news/update?id=${id}`,
        {
          method: "PUT",
          body: formData,
        }
      );

      const result = await response.json();

      if (!result.success) {
        console.error("Update failed:", result.message);
        setError(result.message || "Failed to update news");
      } else {
        console.log("Update successful:", result.message);
        router.push("/news");
      }
    } catch (error) {
      console.error("Error in handleUpdate:", error);
      setError("Failed to update news. Please try again later.");
    }
  };

  return (
    <>
    <div className={styles.container}>
      <div className={styles.form}>
        <h1 className={styles.head}>Update News</h1>
        {error && <div className={styles.error}>{error}</div>}
        
        {existingImageUrl && (
          <div className={styles.imagePreview}>
            <img
              src={existingImageUrl}
              alt="Existing"
              className={styles.previewImage}
            />
          </div>
        )}

        <div className={styles.field}>
          <label htmlFor="title" className={styles.label}>
            Title:
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={handleTitleChange}
            className={styles.inputText}
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="description" className={styles.label}>
            Description:
          </label>
          <textarea
            id="description"
            value={description}
            onChange={handleDescriptionChange}
            className={styles.textarea}
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="file" className={styles.label}>
            Upload Image:
          </label>
          <div className={styles.fileInputContainer}>
            <label htmlFor="file" className={styles.fileInputLabel}>
              Choose File
            </label>
            <input
              type="file"
              id="file"
              onChange={handleFileChange}
              className={styles.fileInput}
            />
            {fileUrl && (
              <div className={styles.imagePreview}>
                <img
                  src={fileUrl}
                  alt="Preview"
                  className={styles.previewImage}
                />
              </div>
            )}
          </div>
        </div>
        <button onClick={handleUpdate} className={styles.button}>
          Update News
        </button>
      </div>
    </div>
    <Footer />
    </>
  );
}
