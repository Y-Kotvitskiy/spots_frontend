import styles from "./PersonalRoom.module.scss";

import type { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAppDispatch, useAuthSelector } from "@/store/hooks";
import { usePlaceCardActions } from "../usePlaceCardActions";
import { authActions } from "@/store";
import { userService } from "@/services/userService";
import { placeService } from "@/services/placeService";
import { usePageError } from "../hooks.ts";

import Icon from "../shared/Icon";
import PlaceCard from "../shared/PlaceCard";
import type { Place } from "@/types/index.ts";
import ConfirmForm from "../shared/ConfirmForm/ConfirmForm.tsx";

const PersonalRoom = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { currentUser } = useAuthSelector();
  const [error, setError] = usePageError("");

  const groupsCount = 0; 
  const [myPlaces, setMyPlaces] = useState<Place[]>([]);
  const [isLoadingMyPlaces, setIsLoadingMyPlaces] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"my-places" | "shared-to-me">("my-places");

  const {
    placeToDelete,
    handleOpenShare,
    handleDeletePersonal,
    handleConfirmDeletePersonal,
    handleCancelDelete,
    handleEdit: handleCardEdit,
  } = usePlaceCardActions((deletedId) => {
    setMyPlaces((prev) => prev.filter((p) => p.id !== deletedId));
  });

  useEffect(() => {
    const fetchMyPlaces = async () => {
      if (!currentUser?.id) return;
      try {
        setIsLoadingMyPlaces(true);
        const backendPlaces = await placeService.getMyPlaces();
        
        const userPersonalPlaces = backendPlaces.map((p) => ({
          ...p,
          category: p.categories?.[0]?.name || "Park",
          categoryId: p.categories?.[0]?.id || "",
          tags: p.tags?.map((t: any) => t.id) || [],
          photos: p.photos?.reduce((acc: any, curr: any) => {
            acc[curr.position] = curr;
            return acc;
          }, {}),
        })) as Place[];

        setMyPlaces(userPersonalPlaces);
      } catch (err) {
        console.error("Failed to load my places:", err);
      } finally {
        setIsLoadingMyPlaces(false);
      }
    };

    fetchMyPlaces();
  }, [currentUser?.id]);

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

  return (
    <main className={styles.PersonalRoom}>
      <div className={styles.container}>
        <div className={styles.personalInfo}>
          {/* Інформація про користувача */}
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
                <h2 className={styles.personalInfo__name}>
                  {currentUser?.name || "Error: Name does not exist"}
                </h2>
              </div>
              <div className={styles.personalInfo__stats}>
                <span className={styles.personalInfo__statItem}>
                  {placesCount} {placesCount === 1 ? "place" : "places"}
                </span>
                <span className={styles.personalInfo__separator}>•</span>
                <span className={styles.personalInfo__statItem}>{groupsCount} groups</span>
              </div>
            </div>
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
              <p className={styles.placesSection__empty}>Loading your places...</p>
            ) : myPlaces.length === 0 ? (
              <p className={styles.placesSection__empty}>You haven't added any places yet.</p>
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
                    category={place.category}
                    workingHours={
                      place.opening_hours
                        ? `${place.opening_hours.opens_at} - ${place.opening_hours.closes_at}`
                        : "08:00 - 20:00"
                    }
                    isShared={0}
                    deleteButtonText="Delete place"
                    onEdit={() => handleCardEdit(place)}
                    onShare={() => handleOpenShare(place)}
                    onDelete={() => handleDeletePersonal(place)}
                    onClick={() => navigate(`/places/${place.id}`)}
                  />
                ))}
              </div>
            )
          ) : (
            <p className={styles.placesSection__empty}>No places have been shared to you yet.</p>
          )}
        </section>
      </div>

      {/* Універсальне модальне вікно підтвердження видалення */}
      <ConfirmForm
        isOpen={!!placeToDelete}
        title="Delete place"
        message={
          <>
            Are you sure you want to delete <strong>{placeToDelete?.name}</strong>?
          </>
        }
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="danger"
        onConfirm={handleConfirmDeletePersonal}
        onClose={handleCancelDelete}
      />

      {error && <p className={styles.PersonalRoom__error}>{error}</p>}
    </main>
  );
};

export default PersonalRoom;