import React, { useState } from "react";
import styles from "./Card.module.css";

interface CardProps {
  id: string;
  title: string;
  description: string;
  image: string;
  link: string;
  date: string;
  onDelete?: (id: string) => void; 
  onUpdate?: (id: string) => void; 
}

const Card: React.FC<CardProps> = ({
  id,
  title,
  description,
  image,
  onDelete,
  onUpdate,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggleDescription = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={styles.card}>
      <img src={image} alt={title} className={styles.image} />
      <h3 className={styles.title}>{title}</h3>
      <p
        className={`${styles.description} ${
          isExpanded ? styles.expanded : styles.collapsed
        }`}
      >
        {description}
      </p>
      <button
        onClick={handleToggleDescription}
        className={styles.showMoreButton}
      >
        {isExpanded ? "Show Less" : "Show More"}
      </button>
      <div className={styles.actions}>
        {onUpdate && (
          <button
            onClick={() => onUpdate(id)}
            className={styles.updateButton}
          >
            Update
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(id)}
            className={styles.deleteButton}
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
};

export default Card;
