import type { AxiosError } from "axios";
import { useAuth } from "../../components/AuthContext.tsx";
import { useNavigate } from "react-router-dom";
import { usePageError } from "../hooks.ts";
import { useEffect, useState } from "react";
import styles from "./PersonalRoom.module.scss";
import Icon from "../shared/Icon/Icon.tsx";

const PersonalRoom = () => {
  const { currentUser, logout } = useAuth();
  const [error, setError] = usePageError("");
  const navigate = useNavigate();

  // Статичні дані (поки що заглушки)
  const [placesCount] = useState(3);
  const [groupsCount] = useState(2);

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
      .catch((err: AxiosError<{ message?: string }>) => {
        setError(err.response?.data?.message ?? "");
      });
  };

  const handleEdit = () => {
    // Логіка для редагування профілю
  };

  return (
    <main className={styles.PersonalRoom}>
      <div className={styles.container}>
        <div className={styles.personalInfo}>
          
          {/* Верхня частина: аватарка + ім'я та статистика */}
          <div className={styles.personalInfo__top}>
            <div className={styles.personalInfo__avatarWrapper}>
              {/* Тут можна підставити аватарку користувача, якщо вона є в currentUser, або дефолтну */}
              <img
                src={currentUser?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb"} 
                alt="User avatar"
                className={styles.personalInfo__avatar}
              />
            </div>

            <div className={styles.personalInfo__content}>
              <h2 className={styles.personalInfo__name}>{currentUser?.name || "Andrii D."}</h2>
              
              <div className={styles.personalInfo__stats}>
                <span className={styles.personalInfo__statItem}>
                  {placesCount} {placesCount === 1 ? "place" : "places"}
                </span>
                <span className={styles.personalInfo__separator}>•</span>
                <span className={styles.personalInfo__statItem}>
                  {groupsCount} {groupsCount === 1 ? "group" : "groups"}
                </span>
              </div>
            </div>
          </div>

          <div className={styles.personalInfo__buttons}>
            <button className={styles.personalInfo__btnEdit} onClick={handleEdit}>
              <Icon name="edit" size={20} className={styles.personalInfo__buttons__icon}/>
              <span className={styles.personalInfo__buttons__text}>Edit</span>
            </button>
            <button className={styles.personalInfo__btnLogout} onClick={handleLogout}>
              <Icon name="exit" size={20} className={styles.personalInfo__buttons__icon}/>
              <span className={styles.personalInfo__buttons__text}>Log out</span>
            </button>
          </div>

        </div>
      </div>
      {error && <p className={styles.PersonalRoom__error}>{error}</p>}
    </main>
  );
};

export default PersonalRoom;
