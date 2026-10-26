import Button from "@/modules/shared/Button";
import styles from "./MapPlaceDetail.module.scss";

import { selectSelectedPlaces } from "@/store/mapSlice";
import { useSelector } from "react-redux";

const MapPlaceDetail: React.FC = () => {
  const place = useSelector(selectSelectedPlaces);

  if (!place) {
    return null;
  }

  return (
    <section className={styles.MapPlaceDetail}>
      <div className={styles.MapPlaceDetail__leftPanel}>
        {place.photo ? (
          <img
            className={styles.MapPlaceDetail__img}
            src=""
            alt="Place image"
          />
        ) : (
          <span className={styles.MapPlaceDetail__img}>No photo</span>
        )}

        <div className={styles.MapPlaceDetail__leftText}>
          <h2 className={styles.MapPlaceDetail__title}>{place.name}</h2>
          <p className={styles.MapPlaceDetail__description}>
            <span>{place.category}</span>
            &middot;
            <span>8-00 - 20-00</span>
          </p>
        </div>
      </div>
      <div className={styles.MapPlaceDetail__Buttons}>
        <button className={styles.MapPlaceDetail__buttonShared}></button>
        <Button text="Details" />
      </div>
    </section>
  );
};

export default MapPlaceDetail;
