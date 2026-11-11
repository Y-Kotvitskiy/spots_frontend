import React, { useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./PlaceDetails.module.scss";
import Icon from "@/modules/shared/Icon";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  actions as mapActions,
  selectSavedPlaces,
  selectSelectedPlaces,
} from "@/store/slices/mapSlice";
import { Tag } from "@/types";
import { useBreakpoint } from "../useBreakpoint";

const PlaceDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { isMobile } = useBreakpoint();

  const savedPlaces = useAppSelector(selectSavedPlaces);
  const selectedPlace = useAppSelector(selectSelectedPlaces);

  const place =
    (selectedPlace?.id === id ? selectedPlace : null) ||
    savedPlaces.find((p) => p.id === id);

  useEffect(() => {
    if (id) {
      dispatch(mapActions.fetchPlaceById(id));
    }
  }, [id, dispatch]);

  const photosList = place?.photos
    ? Object.values(place.photos).sort((a, b) => a.position - b.position)
    : [];

  const mainPhoto = photosList[0];

  const handleAddPhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && id) {
      dispatch(mapActions.uploadPlacePhoto({ placeId: id, file }));
      e.target.value = "";
    }
  };

  const formattedHours = place?.opening_hours
    ? `${place.opening_hours.opens_at}\n${place.opening_hours.closes_at}`
    : "08:00 - 20:00";

  if (!place) {
    return <div className={styles.loading}>Loading place details...</div>;
  }

  // Визначаємо, в якому саме індексі (від 0 до 4) має стояти кнопка плюс (+)
  // Якщо фотографій немає (0), то плюс стоїть на позиції 0 (головне фото)
  // Якщо є N фотографій (і їх менше 5), то плюс стоїть на позиції N
  const addBtnIndex = photosList.length < 5 ? photosList.length : -1;

  return (
    <main className={styles.PlaceDetails}>
      <div className={styles.container}>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: "none" }}
        />

        <div className={styles.gallery}>
          {/* Головне фото (індекс 0) */}
          <div className={styles.mainPhotoCard}>
            <button
              className={styles.backBtn}
              onClick={() => navigate(-1)}
              type="button"
              aria-label="Back"
            >
              <Icon name="back" />
            </button>

            {mainPhoto ? (
              <>
                <img src={mainPhoto.url} alt={place.name} />
                <span className={styles.photoBadge}>1 photo</span>
              </>
            ) : addBtnIndex === 0 ? (
              <button
                type="button"
                className={styles.addPhotoCardFull}
                onClick={handleAddPhotoClick}
                aria-label="Add photo"
              >
                <Icon name="plus" size={isMobile ? 48 : 100} />
              </button>
            ) : null}
          </div>

          {/* Бічна сітка для індексів від 1 до 4 */}
          <div className={styles.sidePhotosGrid}>
            {[1, 2, 3, 4].map((gridIndex) => {
              const photo = photosList[gridIndex];
              const isAddButton = addBtnIndex === gridIndex;

              if (photo) {
                return (
                  <div key={photo.id} className={styles.smallPhotoCard}>
                    <img src={photo.url} alt={`${place.name} ${gridIndex + 1}`} />
                    <span className={styles.photoBadge}>{gridIndex + 1} photo</span>
                  </div>
                );
              }

              if (isAddButton) {
                return (
                  <button
                    key="add-photo"
                    type="button"
                    className={styles.addPhotoCard}
                    onClick={handleAddPhotoClick}
                    aria-label="Add photo"
                  >
                    <Icon name="plus" size={isMobile ? 48 : 100} />
                  </button>
                );
              }

              return (
                <div key={`empty-${gridIndex}`} className={styles.smallPhotoCard} />
              );
            })}
          </div>
        </div>

        <div className={styles.placeHeader}>
          <div className={styles.placeHeader__info}>
            <h1 className={styles.placeHeader__title}>{place.name}</h1>
            <p className={styles.placeHeader__subtitle}>
              <span>{place.categoryName}</span>
              {place.address && (
                <>
                  <span className={styles.placeHeader__separator}>•</span>
                  <span>{place.address}</span>
                </>
              )}
            </p>
          </div>
          <button
            className={styles.placeHeader__actionBtn}
            type="button"
            aria-label="Share"
          >
            <Icon name="send" size={20} />
          </button>
        </div>

        {place.tags && place.tags.length > 0 && (
          <div className={styles.tagsContainer}>
            {place.tags.map((tagKey) => (
              <span key={tagKey} className={styles.tag}>
                {Tag[tagKey] || tagKey}
              </span>
            ))}
          </div>
        )}

        <div className={styles.detailsGrid}>
          <div className={styles.leftColumn}>
            <section className={styles.sectionCard}>
              <h3 className={styles.sectionCard__title}>About location</h3>
              <p className={styles.sectionCard__text}>
                {place.description || "No description provided yet."}
              </p>
            </section>

            <div className={styles.infoRow}>
              <div className={styles.infoBlock}>
                <h3 className={styles.infoBlock__label}>
                  Working hours
                </h3>
                <p className={styles.infoBlock__value}><Icon name="time" size={24} color={styles.placeDetaislIcon}/>{formattedHours}</p>
              </div>
              {place.creator_name && (
                <div className={styles.infoBlock}>
                  <h3 className={styles.infoBlock__label}>Added by</h3>
                  <p className={styles.infoBlock__value}><Icon name="check" size={24} color={styles.placeDetaislIcon}/>{place.creator_name}</p>
                </div>
              )}
            </div>
          </div>

          <div className={styles.rightColumn}>
            <section className={styles.sectionCard}>
              <h3 className={styles.sectionCard__title}>Show on map</h3>
              <div className={styles.mapPreview}>
                <span>
                  {place.latitude.toFixed(4)}, {place.longitude.toFixed(4)}
                </span>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
};

export default PlaceDetails;