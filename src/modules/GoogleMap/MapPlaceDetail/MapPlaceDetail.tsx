import Button from "@/modules/shared/Button";
import styles from "./MapPlaceDetail.module.scss";

import { useMapSelector } from "@/store/hooks";

const MapPlaceDetail: React.FC = () => {
  const { selectedPlace, categories } = useMapSelector();

  if (!selectedPlace) {
    return null;
  }

  return (
    <section className={styles.MapPlaceDetail}>
      <div className={styles.MapPlaceDetail__leftPanel}>
        {selectedPlace.photo ? (
          <img
            className={styles.MapPlaceDetail__img}
            src=""
            alt="Place image"
          />
        ) : (
          <span className={styles.MapPlaceDetail__img}>No photo</span>
        )}

        <div className={styles.MapPlaceDetail__leftText}>
          <h2 className={styles.MapPlaceDetail__title}>{selectedPlace.name}</h2>
          <p className={styles.MapPlaceDetail__description}>
            <span>{categories[selectedPlace.categoryId]}</span>
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
