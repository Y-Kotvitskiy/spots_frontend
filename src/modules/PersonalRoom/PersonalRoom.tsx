import styles from "./PersonalRoom.module.scss";

import type { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { usePageError } from "../hooks.ts";
import { useEffect } from "react";
import { selectSavedPlaces } from "@/store/mapSlice";
import { useSelector } from "react-redux";
import { useAppDispatch, useAuthSelector } from "@/store/hooks";
import { authActions } from "@/store";

const PersonalRoom = () => {
  const dispatch = useAppDispatch();
  const { currentUser } = useAuthSelector();
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

  const handleLogout = async () => {
    try {
      await dispatch(authActions.logout()).unwrap();
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      setError(error.response?.data?.message ?? "");
    }
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
