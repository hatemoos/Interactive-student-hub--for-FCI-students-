"use client";
import React, { useEffect, useState } from "react";
import Footer from "../../../component/footer/Footer";
import styles from "./newsPage.module.css";
import Card from "../../../component/newsCard/Card";
import { useRouter } from "next/navigation";
import Spinner from "../../../component/spinner/Spinner";

interface CardData {
  id: string;
  title: string;
  description: string;
  image: string;
  link: string;
  date: string;
}

interface Data {
  cards: CardData[];
}

interface UserData {
  loggedIn: boolean;
  isAdmin: boolean;
}

const NewsPage = () => {
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
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
        const data: UserData = await response.json();
        setIsAdmin(data.isAdmin);

        if (!data.loggedIn) {
          router.push("/login");
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("Error checking login status:", error);
        router.push("/login");
      }
    };

    checkLoginStatus();
  }, [router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:5000/news/get");
        if (!res.ok) {
          throw new Error(`Fetch Failed, status: ${res.status}`);
        }
        const result: Data = await res.json();
        if (!result.cards) {
          throw new Error("Invalid data structure received");
        }
        setData(result);
      } catch (error) {
        console.error("Fetch Failed:", error);
        setError("Failed to load news. Please try again later.");
      }
    };

    if (!loading) {
      fetchData();
    }
  }, [loading]);

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(
        `http://localhost:5000/news/delete?id=${id}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        throw new Error("Failed to delete the news item");
      }
      const updatedData = data!.cards.filter((card) => card.id !== id);
      setData({ cards: updatedData });
    } catch (error) {
      console.error("Delete Failed:", error);
      setError("Failed to delete news. Please try again later.");
    }
  };

  const handleUpdate = (id: string) => {
    router.push(`/update-news/${id}`);
  };

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  if (!data) {
    return <Spinner />;
  }

  const recentNews = data.cards
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  return (
    <>
      <div>
        <div className={styles.container}>
          <div className={styles.content}>
            <div className={styles.cards}>
              {data.cards.map((card) => (
                <Card
                  key={card.id}
                  {...card}
                  onDelete={isAdmin ? handleDelete : undefined}
                  onUpdate={isAdmin ? handleUpdate : undefined}
                />
              ))}
            </div>
          </div>
          <aside className={styles.recentNews}>
            <h3>Recent News</h3>
            <ul>
              {recentNews.map((newsItem, index) => (
                <li key={index}>
                  <a href={`#news${index + 1}`}>{newsItem.title}</a>
                </li>
              ))}
            </ul>
          </aside>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default NewsPage;
