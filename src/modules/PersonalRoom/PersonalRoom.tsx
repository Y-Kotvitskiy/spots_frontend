import styles from "./PersonalRoom.module.scss";

import type { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { usePageError } from "../hooks.ts";
import { useEffect, useState } from "react";
import { selectSavedPlaces } from "@/store/slices/mapSlice";
import { useSelector } from "react-redux";
import { useAppDispatch, useAuthSelector } from "@/store/hooks";
import { selectGroups } from "@/store/slices/groupSlice";
import { usePlaceCardActions } from "../usePlaceCardActions";
import { authActions } from "@/store";
import { userService } from "@/services/userService";
import Icon from "../shared/Icon";
import EditProfileModal from "./EditProfileModal";
import ShareToGroup from "../shared/PlaceCard/ShareToGroup";
import PlaceCard from "../shared/PlaceCard";

const PersonalRoom = () => {
  const dispatch = useAppDispatch();
  const { currentUser } = useAuthSelector();
  const [error, setError] = usePageError("");
  const navigate = useNavigate();

  const savedPlaces = useSelector(selectSavedPlaces);
  const groups = useSelector(selectGroups);

  const placesCount = savedPlaces.length;
  const groupsCount = groups.length;

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  // Змінено назву вкладки на "shared-to-me"
  const [activeTab, setActiveTab] = useState<"my-places" | "shared-to-me">(
    "my-places",
  );

  const {
    isShareModalOpen,
    handleOpenShare,
    handleCloseShare,
    handleConfirmShare,
    handleDeletePersonal,
    handleEdit: handleCardEdit,
  } = usePlaceCardActions();

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

  const handleSaveProfile = async (newName: string) => {
    if (!currentUser) return;
    try {
      /* TODO change currentUser.id = 1 */
      const updatedUser = await userService.patch(1, {
        name: newName,
      });
      dispatch(authActions.updateUser(updatedUser));
      setIsEditModalOpen(false);
    } catch (err: any) {
      console.error("Failed to update profile:", err);
      setError(err.response?.data?.message || "Failed to update profile");
    }
  };

  // Збираємо місця з усіх груп і залишаємо ТІЛЬКИ ті, які поширені НЕ мною
  const sharedToMePlaces = groups.flatMap((group) =>
    (group.places || [])
      .filter((place: any) => {
        // Перевіряємо, чи цього місця НЕМАЄ в твоїх особистих збережених (savedPlaces)
        const isNotMyPersonalPlace = !savedPlaces.some(
          (p) => p.id === place.id,
        );

        // Перевіряємо по імені або ID автора (залежно від того, що зберігається в об'єкті місця)
        const isNotMyShare =
          place.addedBy !== currentUser?.name &&
          place.userName !== currentUser?.name &&
          place.userId !== 1; // currentUser?.id ;

        return isNotMyPersonalPlace && isNotMyShare;
      })
      .map((place: any) => ({
        ...place,
        sharedGroupName: group.name,
        sharedBy: place.addedBy || place.userName || "Group Member",
      })),
  );

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
                  className={styles.personalInfo__editNameBtn}
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
                  {groupsCount} {groupsCount === 1 ? "group" : "groups"}
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

        {/* Вкладки перемикання */}
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

        {/* Секція зі списком карток залежно від активної вкладки */}
        <section className={styles.placesSection}>
          {activeTab === "my-places" ? (
            savedPlaces.length === 0 ? (
              <p className={styles.placesSection__empty}>
                You haven't added any places yet.
              </p>
            ) : (
              <div className={styles.placesGrid}>
                {savedPlaces.map((place, index) => {
                  const sharedGroupsCount = groups.filter((group) =>
                    group.places?.some((p) => p.id === place.id),
                  ).length;

                  return (
                    <PlaceCard
                      key={place.id || index}
                      image={
                        place.photos?.[0]?.url ||
                        "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&w=600&q=80"
                      }
                      title={place.name}
                      category={place.category}
                      workingHours="08:00 - 20:00"
                      isShared={sharedGroupsCount}
                      deleteButtonText="Delete place"
                      onEdit={() => handleCardEdit(place)}
                      onShare={() => handleOpenShare(place)}
                      onDelete={() => handleDeletePersonal(place.id)}
                      onClick={() => console.log("Clicked place", place.id)}
                    />
                  );
                })}
              </div>
            )
          ) : sharedToMePlaces.length === 0 ? (
            <p className={styles.placesSection__empty}>
              No places have been shared to you yet.
            </p>
          ) : (
            <div className={styles.placesGrid}>
              {sharedToMePlaces.map((place, index) => (
                <PlaceCard
                  key={`${place.id}-${index}`}
                  image={
                    place.photo ||
                    "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&w=600&q=80"
                  }
                  title={place.name}
                  category={place.category}
                  workingHours="08:00 - 20:00"
                  addedBy={`Shared by ${place.sharedBy}`}
                  onClick={() => console.log("Clicked shared place", place.id)}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        currentName={currentUser?.name || ""}
        currentAvatar={currentUser?.avatar}
        onSave={handleSaveProfile}
      />

      <ShareToGroup
        isOpen={isShareModalOpen}
        onClose={handleCloseShare}
        groups={groups}
        onSelectGroup={handleConfirmShare}
      />

      {error && <p className={styles.PersonalRoom__error}>{error}</p>}
    </main>
  );
};

export default PersonalRoom;
