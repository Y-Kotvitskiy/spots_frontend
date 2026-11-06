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

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&w=600&q=80";

const PlaceDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  const sidePhotos = photosList.slice(1, 4);

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
    ? `${place.opening_hours.opens_at} - ${place.opening_hours.closes_at}`
    : "08:00 - 20:00";

  if (!place) {
    return <div className={styles.loading}>Loading place details...</div>;
  }

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
          <div className={styles.mainPhotoCard}>
            <button
              className={styles.backBtn}
              onClick={() => navigate(-1)}
              type="button"
              aria-label="Back"
            >
              <Icon name="back" size={20} />
            </button>
            <img src={mainPhoto?.url || FALLBACK_IMAGE} alt={place.name} />
            {photosList.length > 0 && (
              <span className={styles.photoBadge}>1 photo</span>
            )}
          </div>

          <div className={styles.sidePhotosGrid}>
            {sidePhotos.map((photo, index) => (
              <div key={photo.id} className={styles.smallPhotoCard}>
                <img src={photo.url} alt={`${place.name} ${index + 2}`} />
                <span className={styles.photoBadge}>{index + 2} photo</span>
              </div>
            ))}

            <button
              type="button"
              className={styles.addPhotoCard}
              onClick={handleAddPhotoClick}
              aria-label="Add photo"
            >
              <Icon name="plus" size={28} />
            </button>
          </div>
        </div>

        <div className={styles.placeHeader}>
          <div className={styles.placeHeader__info}>
            <h1 className={styles.placeHeader__title}>{place.name}</h1>
            <p className={styles.placeHeader__subtitle}>
              <span>{place.category}</span>
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
                <h4 className={styles.infoBlock__label}>Working hours</h4>
                <p className={styles.infoBlock__value}>{formattedHours}</p>
              </div>
              {place.creator_name && (
                <div className={styles.infoBlock}>
                  <h4 className={styles.infoBlock__label}>Added by</h4>
                  <p className={styles.infoBlock__value}>{place.creator_name}</p>
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