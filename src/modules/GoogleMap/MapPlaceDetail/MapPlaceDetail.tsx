import Button from "@/modules/shared/Button";
import styles from "./MapPlaceDetail.module.scss";

import { useMapSelector } from "@/store/hooks";
import { CLOSES_AT, OPENS_AT } from "@/modules/constants";
import { useNavigate } from "react-router-dom";

const MapPlaceDetail: React.FC = () => {
  const { selectedPlace } = useMapSelector();
  const navigate = useNavigate();

  if (!selectedPlace) {
    return null;
  }

  const opens_at = selectedPlace.opening_hours?.opens_at || OPENS_AT;
  const closes_at = selectedPlace.opening_hours?.closes_at || CLOSES_AT;

  return (
    <section className={styles.MapPlaceDetail}>
      <div className={styles.MapPlaceDetail__leftPanel}>
        {selectedPlace.photos ? (
          <img
            className={styles.MapPlaceDetail__img}
            src={selectedPlace.photos[0]?.url}
            alt="Place image"
          />
        ) : (
          <span className={styles.MapPlaceDetail__img}>No photo</span>
        )}

        <div className={styles.MapPlaceDetail__leftText}>
          <h2 className={styles.MapPlaceDetail__title}>{selectedPlace.name}</h2>
          <p className={styles.MapPlaceDetail__description}>
            <span>{selectedPlace.categoryName}</span>
            &middot;
            <span>
              {opens_at} - {closes_at}
            </span>
          </p>
          <p className={styles.MapPlaceDetail__creator}>
            <span>Added by</span>
            <span>{selectedPlace.creator_name}</span>
          </p>
        </div>
      </div>
      <div className={styles.MapPlaceDetail__Buttons}>
        <button className={styles.MapPlaceDetail__buttonShared}></button>
        <Button
          text="Details"
          onClick={() => navigate(`/places/${selectedPlace.id}`)}
        />
      </div>
    </section>
  );
};

export default MapPlaceDetail;
