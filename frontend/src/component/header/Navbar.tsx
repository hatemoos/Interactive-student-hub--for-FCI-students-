import React, { useState, useEffect } from "react";
import module from "../header/header.module.css";
import Link from "next/link";
import { FaBars, FaTimes } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { MdNotificationsActive } from "react-icons/md";

interface Notification {
  id: number;
  title: string;
}

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
  const router = useRouter();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/login/check-login",
          {
            method: "GET",
            credentials: "include",
          }
        );
        const data = await response.json();
        setLoggedIn(data.loggedIn);
        setIsAdmin(data.isAdmin);

        if (data.loggedIn && !data.isAdmin) {
          const userResponse = await fetch(
            "http://localhost:5000/login/get-user-name",
            {
              method: "GET",
              credentials: "include",
            }
          );
          const userData = await userResponse.json();
          setUserName(userData.name);
        }
      } catch (error) {
        setError("Error checking login status");
        console.error("Error checking login status:", error);
      } finally {
        setLoading(false);
      }
    };

    checkLoginStatus();
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (loggedIn && !isAdmin) {
        try {
          const response = await fetch(
            "http://localhost:5000/notifications/getAllNotifications",
            {
              method: "GET",
              credentials: "include",
            }
          );
          const data = await response.json();
          setNotifications(data.notifications);
        } catch (error) {
          setError("Error fetching notifications");
          console.error("Error fetching notifications:", error);
        }
      }
    };

    fetchNotifications();
  }, [loggedIn, isAdmin]);

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:5000/login/logout", {
        method: "POST",
        credentials: "include",
      });
      setLoggedIn(false);
      setIsAdmin(false);
      console.log("Logout successful");
      router.push("/login");
    } catch (error) {
      setError("Error during logout");
      console.error("Error during logout:", error);
    }
  };

  const handleNotificationClick = () => {
    setShowNotifications(false);
    router.push("/news");
  };

  const getUserInitials = (name: string) => {
    if (!name) return "";
    const nameParts = name.split(" ");
    const initials =
      nameParts.length > 1
        ? `${nameParts[0][0]}${nameParts[1][0]}`
        : nameParts[0][0];
    return initials.toUpperCase();
  };

  return (
    <nav className={module.nav}>
      <div className={module.hamburger} onClick={toggleMenu}>
        {isOpen ? <FaTimes /> : <FaBars />}
      </div>
      <div className={module.logo}>FCI</div>
      <ul className={`${module.navLinks} ${isOpen ? module.showMenu : ""}`}>
        {loggedIn && (
          <div className={module.userIconContainer}>
            {!isAdmin && (
              <div className={module.userIcon} title={userName}>
                {getUserInitials(userName)}
              </div>
            )}
            {isAdmin && (
              <span className={`${module.userIcon} ${module.adminIcon}`}>
                Admin
              </span>
            )}
          </div>
        )}
        <li>
          <Link href="/">Home</Link>
        </li>
        <li>
          <Link href="#about">About</Link>
        </li>
        <li>
          <a
            href="https://www.aun.edu.eg/fci/ar/home-2"
            target="_blank"
            rel="noopener noreferrer"
          >
            Contact
          </a>
        </li>
      </ul>
      <div className={module.authLinks}>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className={module.error}>{error}</p>
        ) : loggedIn ? (
          <>
            {isAdmin && (
              <Link href="/admin" className={module.dashboard}>
                Dashboard
              </Link>
            )}
            {!isAdmin && (
              <div className={module.notificationContainer}>
                <MdNotificationsActive
                  className={module.notification}
                  onClick={toggleNotifications}
                  aria-label="Notifications"
                />
                {showNotifications && (
                  <div className={module.notificationDropdown}>
                    <ul>
                      {notifications.map((notification) => (
                        <li
                          key={notification.id}
                          className={module.notificationItem}
                          onClick={handleNotificationClick}
                        >
                          {notification.title}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            <button
              onClick={handleLogout}
              className={module.logout}
              aria-label="Logout"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className={module.login}>
              Log In
            </Link>
            <Link href="/register" className={module.signup}>
              Free Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
