import type { AxiosError } from "axios";
import { useAuth } from "../../components/AuthContext.tsx";
import { useNavigate } from "react-router-dom";
import { usePageError } from "../hooks.ts";
import { userService } from "@/services/userService.ts";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectSavedPlaces } from "@/store/mapSlice";

import styles from "./PersonalRoom.module.scss";
import Icon from "../shared/Icon/Icon.tsx";
import EditProfileModal from "./EditProfileModal";
import PlaceCard from "./PlaceCard/PlaceCard.tsx";

const PersonalRoom = () => {
  const { currentUser, logout, updateUser } = useAuth();
  const [error, setError] = usePageError("");
  const navigate = useNavigate();

  const savedPlaces = useSelector(selectSavedPlaces);

  const placesCount = savedPlaces.length;
  const [groupsCount] = useState(2);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = async (newName: string) => {
    if (!currentUser) return;

    try {
      const updatedUser = await userService.patch(currentUser.id, { name: newName });
      updateUser(updatedUser); 
      setIsEditModalOpen(false);
    } catch (err: any) {
      console.error("Failed to update profile:", err);
      setError(err.response?.data?.message || "Failed to update profile");
    }
  };

  return (
    <main className={styles.PersonalRoom}>
      <div className={styles.container}>
        <div className={styles.personalInfo}>
          
          {/* Верхня частина: аватарка + ім'я та статистика */}
          <div className={styles.personalInfo__top}>
            <div className={styles.personalInfo__avatarWrapper}>
              <img
                src={currentUser?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb"} 
                alt="User avatar"
                className={styles.personalInfo__avatar}
              />
            </div>

            <div className={styles.personalInfo__content}>
              <div className={styles.personalInfo__nameRow}>
                <h2 className={styles.personalInfo__name}>{currentUser?.name || "Error: Name does not exist"}</h2>
                <button className={styles.personalInfo__editNameBtn} onClick={handleEdit}>
                  Edit name
                </button>
              </div>
              
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
            <button className={styles.personalInfo__buttons__edit} onClick={handleEdit}>
              <Icon name="edit" size={20} className={styles.personalInfo__buttons__icon}/>
              <span className={styles.personalInfo__buttons__text}>Edit</span>
            </button>

            <button className={styles.personalInfo__buttons__logout} onClick={handleLogout}>
              <Icon name="exit" size={20} className={styles.personalInfo__buttons__icon}/>
              <span className={styles.personalInfo__buttons__text}>Log out</span>
            </button>
          </div>

        </div>

        {/* Секція зі списком реальних карток місць */}
        <section className={styles.placesSection}>
          <h3 className={styles.placesSection__title}>My places</h3>
          
          {savedPlaces.length === 0 ? (
            <p className={styles.placesSection__empty}>You haven't added any places yet.</p>
          ) : (
            <div className={styles.placesGrid}>
              {savedPlaces.map((place, index) => (
                <PlaceCard
                  key={place.id || index}
                  image={place.image || "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&w=600&q=80"}
                  title={place.name || place.title}
                  category={place.category}
                  workingHours={place.workingHours || "08:00 - 20:00"}
                  isShared={place.isShared || false}
                  onEdit={() => console.log("Edit place", place.id)}
                  onShare={() => console.log("Share place", place.id)}
                  onDelete={() => console.log("Delete place", place.id)}
                  onClick={() => console.log("Clicked place", place.id)}
                />
              ))}
            </div>
          )}
        </section>

      </div>

      {/* Модальне вікно редагування профілю */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        currentName={currentUser?.name || ""}
        currentAvatar={currentUser?.avatar}
        onSave={handleSaveProfile}
      />

      {error && <p className={styles.PersonalRoom__error}>{error}</p>}
    </main>
  );
};

export default PersonalRoom;