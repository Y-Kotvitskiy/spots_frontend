import styles from "./PersonalRoom.module.scss";

import type { AxiosError } from "axios";
import { useAuth } from "../../components/AuthContext.tsx";
import { useNavigate } from "react-router-dom";
import { usePageError } from "../hooks.ts";
import { useEffect } from "react";
import { selectSavedPlaces } from "@/store/mapSlice";
import { useSelector } from "react-redux";

const PersonalRoom = () => {
  const { currentUser, logout } = useAuth();
  const [error, setError] = usePageError("");
  const navigate = useNavigate();
  const places = useSelector(selectSavedPlaces);

  useEffect(() => {
    if (!error) return;

    const timerId = setTimeout(() => {
      navigate("/");
    }, 3000);

    return () => {
      clearTimeout(timerId);
    };
  }, [navigate, error]);

  const handleLogout = () => {
    logout()
      .then(() => {
        navigate("/");
      })
      .catch((error: AxiosError<{ message?: string }>) => {
        setError(error.response?.data?.message ?? "");
      });
  };

  return (
    <main className={styles.PersonalRoom}>
      <h1>Personal Room</h1>
      <dl>
        <dt>
          <strong>Username:</strong>
        </dt>
        <dd>{currentUser?.name}</dd>
        <dt>
          <strong>Email:</strong>
        </dt>
        <dd>{currentUser?.email}</dd>
      </dl>

      <pre>
        {places.length > 0 ? JSON.stringify(places, null, 2) : "No places"}
      </pre>
      <button onClick={handleLogout}>Log out</button>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </main>
  );
};

export default PersonalRoom;
