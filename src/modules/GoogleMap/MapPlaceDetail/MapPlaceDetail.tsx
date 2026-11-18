import Button from "@/modules/shared/Button";
import styles from "./MapPlaceDetail.module.scss";

import { useMapSelector } from "@/store/hooks";
import { CLOSES_AT, OPENS_AT } from "@/modules/constants";
import { NavLink, useNavigate } from "react-router-dom";

const MapPlaceDetail: React.FC = () => {
  const { selectedPlace } = useMapSelector();
  const navigate = useNavigate();

  if (!selectedPlace) {
    return null;
  }
  const opens_at = selectedPlace.opening_hours?.opens_at || OPENS_AT;
  const closes_at = selectedPlace.opening_hours?.closes_at || CLOSES_AT;

  const firstPhoto = Object.entries(selectedPlace?.photos || {}).sort(
    ([keyA], [keyB]) => Number(keyA) - Number(keyB),
  )[0]?.[1];

  const imageUrl = firstPhoto?.url;

  return (
    <section className={styles.MapPlaceDetail}>
      <div className={styles.MapPlaceDetail__leftPanel}>
        {imageUrl ? (
          <img
            className={styles.MapPlaceDetail__img}
            src={imageUrl}
            alt="Place image"
          />
        ) : (
          <span className={styles.MapPlaceDetail__img}>No photo</span>
        )}

        <div className={styles.MapPlaceDetail__leftText}>
          <h2 className={styles.MapPlaceDetail__title}>
            <NavLink
              to={`/map/${selectedPlace.id}`}
              state={{ timestamp: Date.now() }}
            >
              {selectedPlace.name}
            </NavLink>
          </h2>
          <p className={styles.MapPlaceDetail__description}>
            <span>{selectedPlace.categoryName}</span>
            &middot;
            <span>
              {opens_at} - {closes_at}
            </span>
          </p>
          <p className={styles.MapPlaceDetail__creator}>
            <span>Added by</span>
            <span className={styles.MapPlaceDetail__textOneLine}>
              {selectedPlace.creator_name}
            </span>
          </p>
        </div>
      </div>
      <button className={styles.MapPlaceDetail__buttonShared}></button>
      <Button
        text="Details"
        onClick={() => navigate(`/places/${selectedPlace.id}`)}
        classNames={styles.MapPlaceDetail__buttonDetail}
      />
    </section>
  );
};

export default MapPlaceDetail;
