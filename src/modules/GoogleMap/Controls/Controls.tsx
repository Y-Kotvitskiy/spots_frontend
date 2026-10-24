import styles from "./Controls.module.scss";
import { Link } from "react-router-dom";
import SearchInput from "./SearchInput";
import { selectIsPickingMode, selectSelectedCoords } from "@/store/mapSlice";
import { useSelector } from "react-redux";
import { useAppDispatch } from "@/store/hooks";
import { mapActions } from "@/store";
import { getAddressFromCoords } from "../utils";
import { useMap } from "@vis.gl/react-google-maps";
import { useState } from "react";
import SavePlaceForm from "./SavePlaceForm";

const Controls: React.FC = () => {
  const [savingMode, setSavingMode] = useState(false);
  const isPickingMode = useSelector(selectIsPickingMode);
  const selectedCoords = useSelector(selectSelectedCoords);
  const dispatch = useAppDispatch();

  const map = useMap();

  const handleAddButtonClick = async () => {
    if (isPickingMode) {
      if (!savingMode) {
        setSavingMode(true);
      }
    } else {
      const newState = !isPickingMode;

      dispatch(mapActions.togglePickingMode());

      if (selectedCoords && !newState) {
        dispatch(mapActions.setSelectedCoords(null));
      }

      // Используем map из useMap() вместо mapInstanceRef.current
      if (map && newState && !selectedCoords) {
        const center = map.getCenter();

        if (center) {
          const lat = center.lat();
          const lng = center.lng();
          const address = await getAddressFromCoords(lat, lng);

          dispatch(mapActions.setSelectedCoords({ lat, lng, address }));
        }
      }
    }
  };

  const handleSavePlaceClose = () => {
    setSavingMode(false);
    dispatch(mapActions.setPickingMode(false));
    dispatch(mapActions.setSelectedCoords(null));
  };

  return (
    <aside className={styles.Controls}>
      <Link className={styles.Controls__brand} to={"/"}>
        <img src="/logo_mobile.svg" />
      </Link>
      <SearchInput />
      <button className={styles.Controls__filter}></button>
      <button
        className={styles.Controls__addButton}
        onClick={handleAddButtonClick}
      >
        {isPickingMode ? (
          <>Save</>
        ) : (
          <>
            <span className={styles.Controls__addButtonPlus}>+</span> Add place
          </>
        )}
      </button>
      <SavePlaceForm isOpen={savingMode} onClose={handleSavePlaceClose} />
    </aside>
  );
};

export default Controls;
