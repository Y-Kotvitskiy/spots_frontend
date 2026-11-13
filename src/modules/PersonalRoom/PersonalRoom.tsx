import styles from "./PersonalRoom.module.scss";

import type { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAuthSelector, useMapSelector } from "@/store/hooks";
import { usePlaceCardActions } from "../usePlaceCardActions";
import { authActions, mapActions } from "@/store";
import { usePageError } from "../hooks.ts";

import PlaceCard from "../shared/PlaceCard";
import type { Place } from "@/types/index.ts";
import ConfirmForm from "../shared/ConfirmForm/ConfirmForm.tsx";
import Icon from "../shared/Icon";
import Loader from "@/modules/shared/Loader";
import Placeholder from "../shared/Placeholder";
import EditProfile from "./EditProfileModal/EditProfileModal.tsx";
import EditPlaceModal from "../shared/PlaceCard/EditPlace/index.ts";
import { userService } from "@/services/userService.ts";

const PersonalRoom = () => {

  // ==========================================
  // HOOKS & SELECTORS
  // ==========================================

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { currentUser } = useAuthSelector();
  const [error, setError] = usePageError("");

  // ==========================================
  // STATES & REFS
  // ==========================================

  const groupsCount = 0;
  const [myPlaces, setMyPlaces] = useState<Place[]>([]);
  const [isLoadingMyPlaces, setIsLoadingMyPlaces] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAvatarLoaded, setIsAvatarLoaded] = useState(false);
  const hasFetchedRef = useRef(false);
  
  const imgRef = useRef<HTMLImageElement>(null);
  const [placeToEdit, setPlaceToEdit] = useState<Place | null>(null);

  const [activeTab, setActiveTab] = useState<"my-places" | "shared-to-me">(
    "my-places",
  );

  useEffect(() => {
    if (imgRef.current && imgRef.current.complete) {
      setIsAvatarLoaded(true);
    }
  }, [currentUser?.avatar]);

  // ==========================================
  // CARD ACTIONS & SELECTORS
  // ==========================================

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

  // ==========================================
  // EFFECTS (DATA FETCHING & TIMERS)
  // ==========================================


  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    let isMounted = true;

    const fetchUserOnce = async () => {
      try {
        const userProfile = await userService.getMe();
        if (isMounted) {
          dispatch(authActions.updateUser(userProfile));
        }
      } catch (err) {
        console.error("Failed to fetch user profile:", err);
      }
    };

    fetchUserOnce();

    return () => {
      isMounted = false;
    };
  }, [dispatch]);

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

  useEffect(() => {
    if (!error) return;
    const timerId = setTimeout(() => {
      navigate("/");
    }, 3000);
    return () => clearTimeout(timerId);
  }, [navigate, error]);

  // ==========================================
  // EVENT HANDLERS
  // ==========================================

  const handlePlaceUpdated = (updatedPlace: Place) => {
    setMyPlaces((prevPlaces) =>
      prevPlaces.map((p) => (p.id === updatedPlace.id ? updatedPlace : p))
    );

    dispatch(mapActions.updatePlace(updatedPlace));
  };

  const placesCount = myPlaces.length;

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
    } catch (error: unknown) {
      console.error("Failed to update profile:", error);
      throw error;
    }
  };

  const userName = currentUser?.name || "User";

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <main className={styles.PersonalRoom}>
      <div className={styles.container}>

        {/* User Info Section */}

        <div className={styles.personalInfo}>
          <div className={styles.personalInfo__top}>
            <div className={styles.personalInfo__avatarWrapper}>

              {/* Патерн-заглушка */}

              {(!currentUser?.avatar || !isAvatarLoaded) && (
                <div className={styles.personalInfo__patternPlaceholder}>
                  <Placeholder text={userName} rows={8} cols={8} />
                  {currentUser?.avatar && (
                    <Loader className={styles.personalInfo__avatarLoader} />
                  )}
                </div>
              )}

              {/* Реальна картинка аватара */}

              {currentUser?.avatar && (
                <img
                  ref={imgRef}
                  src={currentUser.avatar}
                  alt="User avatar"
                  className={`${styles.personalInfo__avatar} ${
                    isAvatarLoaded
                      ? styles.personalInfo__avatarLoaded
                      : styles.personalInfo__avatarHidden
                  }`}
                  onLoad={() => setIsAvatarLoaded(true)}
                />
              )}
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
                <span>
                  {placesCount} {placesCount === 1 ? "place" : "places"}
                </span>
                <span className={styles.personalInfo__separator}>•</span>
                <span>
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
              />
              <span>Edit</span>
            </button>
            <button
              className={styles.personalInfo__buttons__logout}
              onClick={handleLogout}
            >
              <Icon
                name="exit"
                size={20}
              />
              <span>
                Log out
              </span>
            </button>
          </div>
        </div>

        {/* Tabs Navigation */}

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

        {/* Places Section */}

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
                {myPlaces.map((place) => (
                  <PlaceCard
                    key={`${place.id}_${place.photos?.[0]?.url || 'no-photo'}`}
                    image={place.photos?.[0]?.url || ""}
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
                {savedPlaces.map((place) => {
                  const isMyPlace = currentUser?.id && place.creator_id === currentUser.id;

                  return (
                    <PlaceCard
                      key={`${place.id}_${place.photos?.[0]?.url || 'no-photo'}`}
                      image={place.photos?.[0]?.url || ""}
                      title={place.name}
                      category={place.categoryName}
                      workingHours={
                        place.opening_hours
                          ? `${place.opening_hours.opens_at}\n${place.opening_hours.closes_at}`
                          : "none"
                      }
                      addedBy={place.creator_name} 
                      deleteButtonText="Delete place"
                      
                      onEdit={isMyPlace ? () => setPlaceToEdit(place) : undefined}
                      onShare={isMyPlace ? () => handleOpenShare(place) : undefined}
                      onDelete={isMyPlace ? () => handleDeletePersonal(place) : undefined}
                      
                      onClick={() => navigate(`/places/${place.id}`)}
                    />
                  );
                })}
              </div>
            )
          )}
        </section>
      </div>

      {/* Modals & Notifications */}

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

      <EditProfile
        key={currentUser?.avatar + (isEditModalOpen ? "_open" : "_closed")}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        currentName={currentUser?.name || ""}
        currentAvatar={currentUser?.avatar}
        onSave={handleSaveProfile}
      />

      {placeToEdit && (
        <EditPlaceModal
          key={placeToEdit.id}
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