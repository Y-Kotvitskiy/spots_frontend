import Button from "@/modules/shared/Button";
import styles from "./MapPlaceDetail.module.scss";

import { CLOSES_AT, OPENS_AT } from "@/modules/constants";
import { NavLink, useNavigate } from "react-router-dom";
import { useMap } from "@vis.gl/react-google-maps";
import type { Place } from "@/types";

interface Props {
  selectedPlace: Place;
  openPlaceShareModal: () => void;
}

const MapPlaceDetail: React.FC<Props> = ({
  selectedPlace,
  openPlaceShareModal,
}) => {
  const navigate = useNavigate();
  const map = useMap();

  if (!selectedPlace) {
    return null;
  }

  const opens_at = selectedPlace.opening_hours?.opens_at || OPENS_AT;
  const closes_at = selectedPlace.opening_hours?.closes_at || CLOSES_AT;

  const firstPhoto = Object.entries(selectedPlace?.photos || {}).sort(
    ([keyA], [keyB]) => Number(keyA) - Number(keyB),
  )[0]?.[1];

  const imageUrl = firstPhoto?.url;

  const handleNameClick = (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
  ) => {
    event.preventDefault();
    debugger;
    if (map && selectedPlace) {
      map.panTo({ lat: selectedPlace.latitude, lng: selectedPlace.longitude });
    }
  };

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
              className={styles.MapPlaceDetail__titleLink}
              onClick={handleNameClick}
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
      <button
        className={styles.MapPlaceDetail__buttonShared}
        onClick={openPlaceShareModal}
      ></button>
      <Button
        text="Details"
        onClick={() => navigate(`/places/${selectedPlace.id}`)}
        classNames={styles.MapPlaceDetail__buttonDetail}
      />
    </section>
  );
};

export default MapPlaceDetail;
