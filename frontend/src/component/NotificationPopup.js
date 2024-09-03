"use client"
import React, { useEffect, useState } from 'react';

const NotificationCard = ({ title, date, index, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div style={{ ...notificationCardStyle, bottom: `${index * 60}px` }}>
      <div style={notificationContentStyle}>
        <span>{title} - {new Date(date).toLocaleDateString()}</span>
      </div>
      <button style={closeButtonStyle} onClick={onClose}>×</button>
    </div>
  );
};

const NotificationPopUp = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchNewNotifications();
    addKeyframes();
  }, []);

  const fetchNewNotifications = async () => {
    try {
      const response = await fetch('http://localhost:5000/notifications/getNewNotifications', {
        method: 'GET',
        credentials: 'include', 
      });

      if (response.ok) {
        const data = await response.json();
        if (data.notifications && data.notifications.length > 0) {
          const sortedNotifications = data.notifications.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
          setNotifications(sortedNotifications);
        }
      } else {
        console.error('Failed to fetch notifications.');
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleClose = (index) => {
    setNotifications(notifications.filter((_, i) => i !== index));
  };

  const addKeyframes = () => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(100%);
        }
        to {
          transform: translateX(0);
        }
      }
    `;
    document.head.appendChild(style);
  };

  return (
    <>
      {notifications.map((notification, index) => (
        <NotificationCard
          key={index}
          title={notification.title}
          date={notification.uploadDate}
          index={index} 
          onClose={() => handleClose(index)}
        />
      ))}
    </>
  );
};

const notificationCardStyle = {
  position: 'fixed',
  right: 0,
  margin: '10px',
  backgroundColor: 'rgb(0, 0, 0, 0.8)',
  color: 'white',
  padding: '10px',
  borderRadius: '5px',
  border: '2px solid black',
  display: 'flex',
  alignItems: 'center',
  width: '300px',
  animation: 'slideIn 0.5s forwards',
};

const notificationContentStyle = {
  flex: 1,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  position: 'relative',
};

const closeButtonStyle = {
  background: 'transparent',
  border: 'none',
  color: 'white',
  fontSize: '20px',
  cursor: 'pointer',
};

export default NotificationPopUp;
