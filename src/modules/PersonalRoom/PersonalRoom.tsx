import styles from "./PersonalRoom.module.scss";

import type { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAppDispatch, useAuthSelector, useMapSelector } from "@/store/hooks";
import { usePlaceCardActions } from "../usePlaceCardActions";
import { authActions, mapActions } from "@/store";
import { usePageError } from "../hooks.ts";

import PlaceCard from "../shared/PlaceCard";
import type { Place } from "@/types/index.ts";
import ConfirmForm from "../shared/ConfirmForm/ConfirmForm.tsx";
import Icon from "../shared/Icon";
import EditProfileModal from "./EditProfileModal/EditProfileModal.tsx";
import EditPlaceModal from "../shared/EditPlace";
import { userService } from "@/services/userService.ts";

const PersonalRoom = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { currentUser } = useAuthSelector();
  const [error, setError] = usePageError("");

  const groupsCount = 0;
  const [myPlaces, setMyPlaces] = useState<Place[]>([]);
  const [isLoadingMyPlaces, setIsLoadingMyPlaces] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const [placeToEdit, setPlaceToEdit] = useState<Place | null>(null);

  const [activeTab, setActiveTab] = useState<"my-places" | "shared-to-me">(
    "my-places",
  );

  const {
    placeToDelete,
    handleOpenShare,
    handleDeletePersonal,
    handleConfirmDeletePersonal,
    handleCancelDelete,
  } = usePlaceCardActions((deletedId) => {
    setMyPlaces((prev) => prev.filter((p) => p.id !== deletedId));
  });

  const { savedPlaces } = useMapSelector();

  useEffect(() => {
    const fetchUserIfNeeded = async () => {
      if (!currentUser?.name || !currentUser?.avatar) {
        try {
          const userProfile = await userService.getMe();
          dispatch(authActions.updateUser(userProfile));
        } catch (err) {
          console.error("Failed to fetch user profile:", err);
        }
      }
    };
    fetchUserIfNeeded();
  }, [currentUser, dispatch]);

  useEffect(() => {
    const fetchMyPlaces = async () => {
      if (!currentUser?.id) return;
      try {
        setIsLoadingMyPlaces(true);
        const userPersonalPlaces = savedPlaces.filter(
          (place) => place.creator_id === currentUser.id,
        );
        setMyPlaces(userPersonalPlaces);
      } catch (err) {
        console.error("Failed to load my places:", err);
      } finally {
        setIsLoadingMyPlaces(false);
      }
    };

    fetchMyPlaces();
  }, [currentUser?.id, savedPlaces]);

  // Функція для оновлення місця в локальному стейті та Redux
  const handlePlaceUpdated = (updatedPlace: Place) => {
    // 1. Оновлюємо локальний стейт кімнати
    setMyPlaces((prevPlaces) =>
      prevPlaces.map((p) => (p.id === updatedPlace.id ? updatedPlace : p))
    );

    // 2. Оновлюємо стан у Redux (якщо твій стор мапи має таку дію)
    dispatch(mapActions.updatePlace(updatedPlace));
  };

  const placesCount = myPlaces.length;

  useEffect(() => {
    if (!error) return;
    const timerId = setTimeout(() => {
      navigate("/");
    }, 3000);
    return () => clearTimeout(timerId);
  }, [navigate, error]);

  const handleLogout = async () => {
    try {
      await dispatch(authActions.logout()).unwrap();
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      setError(error.response?.data?.message ?? "");
    }
  };

  const handleSaveProfile = async (newName: string, avatarFile?: File) => {
    try {
      const updatedUser = await userService.updateMe({
        display_name: newName,
        file: avatarFile,
      });
      dispatch(authActions.updateUser(updatedUser));
      setIsEditModalOpen(false);
    } catch (err: any) {
      console.error("Failed to update profile:", err);
      setError(err.response?.data?.message || "Failed to update profile");
      throw err;
    }
  };

  return (
    <main className={styles.PersonalRoom}>
      <div className={styles.container}>
        <div className={styles.personalInfo}>
          <div className={styles.personalInfo__top}>
            <div className={styles.personalInfo__avatarWrapper}>
              <img
                src={
                  currentUser?.avatar ||
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb"
                }
                alt="User avatar"
                className={styles.personalInfo__avatar}
              />
            </div>
            <div className={styles.personalInfo__content}>
              <div className={styles.personalInfo__nameRow}>
                <h2 className={styles.personalInfo__name}>
                  {currentUser?.name || "Error: Name does not exist"}
                </h2>
                <button
                  className={styles.personalInfo__EditBtn}
                  onClick={() => setIsEditModalOpen(true)}
                >
                  Edit name
                </button>
              </div>
              <div className={styles.personalInfo__stats}>
                <span className={styles.personalInfo__statItem}>
                  {placesCount} {placesCount === 1 ? "place" : "places"}
                </span>
                <span className={styles.personalInfo__separator}>•</span>
                <span className={styles.personalInfo__statItem}>
                  {groupsCount} groups
                </span>
              </div>
            </div>
          </div>

          <div className={styles.personalInfo__buttons}>
            <button
              className={styles.personalInfo__buttons__edit}
              onClick={() => setIsEditModalOpen(true)}
            >
              <Icon
                name="edit"
                size={20}
                className={styles.personalInfo__buttons__icon}
              />
              <span className={styles.personalInfo__buttons__text}>Edit</span>
            </button>
            <button
              className={styles.personalInfo__buttons__logout}
              onClick={handleLogout}
            >
              <Icon
                name="exit"
                size={20}
                className={styles.personalInfo__buttons__icon}
              />
              <span className={styles.personalInfo__buttons__text}>
                Log out
              </span>
            </button>
          </div>
        </div>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === "my-places" ? styles.tab_active : ""}`}
            onClick={() => setActiveTab("my-places")}
          >
            My places
          </button>
          <button
            className={`${styles.tab} ${activeTab === "shared-to-me" ? styles.tab_active : ""}`}
            onClick={() => setActiveTab("shared-to-me")}
          >
            Shared to me
          </button>
        </div>

        <section className={styles.placesSection}>
          {activeTab === "my-places" ? (
            isLoadingMyPlaces ? (
              <p className={styles.placesSection__empty}>
                Loading your places...
              </p>
            ) : myPlaces.length === 0 ? (
              <p className={styles.placesSection__empty}>
                You haven't added any places yet.
              </p>
            ) : (
              <div className={styles.placesGrid}>
                {myPlaces.map((place, index) => (
                  <PlaceCard
                    key={place.id || index}
                    image={
                      place.photos?.[0]?.url ||
                      "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&w=600&q=80"
                    }
                    title={place.name}
                    category={place.categoryName}
                    workingHours={
                      place.opening_hours
                        ? `${place.opening_hours.opens_at}\n${place.opening_hours.closes_at}`
                        : "none"
                    }
                    isShared={0}
                    deleteButtonText="Delete place"
                    onEdit={() => setPlaceToEdit(place)}
                    onShare={() => handleOpenShare(place)}
                    onDelete={() => handleDeletePersonal(place)}
                    onClick={() => navigate(`/places/${place.id}`)}
                  />
                ))}
              </div>
            )
          ) : (
            savedPlaces.length === 0 ? (
              <p className={styles.placesSection__empty}>
                No places available on the map yet.
              </p>
            ) : (
              <div className={styles.placesGrid}>
                {savedPlaces.map((place, index) => (
                  <PlaceCard
                    key={place.id || index}
                    image={
                      place.photos?.[0]?.url ||
                      "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&w=600&q=80"
                    }
                    title={place.name}
                    category={place.categoryName}
                    workingHours={
                      place.opening_hours
                        ? `${place.opening_hours.opens_at}\n${place.opening_hours.closes_at}`
                        : "none"
                    }
                    addedBy={place.creator_name}
                    deleteButtonText="Delete place"
                    onEdit={() => setPlaceToEdit(place)}
                    onShare={() => handleOpenShare(place)}
                    onDelete={() => handleDeletePersonal(place)}
                    onClick={() => navigate(`/places/${place.id}`)}
                  />
                ))}
              </div>
            )
          )}
        </section>
      </div>

      <ConfirmForm
        isOpen={!!placeToDelete}
        title="Delete place"
        message={
          <>
            <strong>{placeToDelete?.name}</strong>
            {" "}will be removed from the map and from all groups it was shared with.
            <br/>
            <p>This can’t be undone.</p>
          </>
        }
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="danger"
        onConfirm={handleConfirmDeletePersonal}
        onClose={handleCancelDelete}
      />

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        currentName={currentUser?.name || ""}
        currentAvatar={currentUser?.avatar}
        onSave={handleSaveProfile}
      />

      {/* Передаємо хендлер onUpdate у модалку */}
      {placeToEdit && (
        <EditPlaceModal
          isOpen={!!placeToEdit}
          onClose={() => setPlaceToEdit(null)}
          place={placeToEdit}
          onUpdate={handlePlaceUpdated}
        />
      )}

      {error && <p className={styles.PersonalRoom__error}>{error}</p>}
    </main>
  );
};

export default PersonalRoom;