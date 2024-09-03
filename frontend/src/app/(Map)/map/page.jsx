"use client";
import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Map from "./Map";
import styles from "./Map.module.css";
import { useRouter } from "next/navigation";
import Spinner from "../../../component/spinner/Spinner";

const MapFc = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [coordinates, setCoordinates] = useState(null);
  const router = useRouter();

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
        if (data.loggedIn) {
          setIsLoggedIn(true);
        } else {
          router.push("/login");
        }
      } catch (error) {
        console.error("Error checking login status:", error);
        router.push("/login");
      }
    };

    checkLoginStatus();
  }, [router]);

  const handleGoToGoogleMaps = (coords) => {
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`;
    window.location.href = googleMapsUrl;
  };

  const handleLocationSelect = (coords) => {
    setCoordinates(coords);
    handleGoToGoogleMaps(coords);
  };

  if (!isLoggedIn) {
    return <Spinner />;
  }

  return (
    <Sidebar onLocationSelect={handleLocationSelect}>
      <Map coordinates={coordinates} />
      <button className={styles.mapButton} onClick={() => handleGoToGoogleMaps(coordinates)}>
        View in Google Maps
      </button>
    </Sidebar>
  );
};

export default MapFc;
