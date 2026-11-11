import styles from "./Controls.module.scss";
import { Link } from "react-router-dom";
import SearchInput from "./SearchInput";
import {
  MapMode,
  selectMapMode,
  selectSelectedCoords,
} from "@/store/slices/mapSlice";
import { useSelector } from "react-redux";
import { useAppDispatch } from "@/store/hooks";
import { mapActions } from "@/store";
import { useMap } from "@vis.gl/react-google-maps";
import MapFilter from "./MapFilter";
import { useRef } from "react";

const Controls: React.FC = () => {
  const mapMode = useSelector(selectMapMode);
  const selectedCoords = useSelector(selectSelectedCoords);
  const dispatch = useAppDispatch();
  const filterButton = useRef<HTMLButtonElement>(null);

  const map = useMap();

  const putMarkerToCenter = async () => {
    if (map) {
      const center = map.getCenter();

      if (center) {
        const lat = center.lat();
        const lng = center.lng();
        dispatch(mapActions.setSelectedCoords({ lat, lng, address: "" }));
      }
    }
  };

  const handleAddButtonClick = async () => {
    if (mapMode == MapMode.Show) {
      if (!selectedCoords) {
        await putMarkerToCenter();
      }
      dispatch(mapActions.setMapMode(MapMode.Select));
      return;
    }

    if (mapMode == MapMode.Select) {
      dispatch(mapActions.setMapMode(MapMode.Add));
    }
  };

  const handleFilterButton = () => {
    if (mapMode !== MapMode.Filter) {
      dispatch(mapActions.setMapMode(MapMode.Filter));
      dispatch(mapActions.setSelectedCoords(null));
      dispatch(mapActions.clearSelectedPlace());
    } else {
      dispatch(mapActions.setMapMode(MapMode.Show));
    }
  };

  return (
    <aside className={styles.Controls}>
      <Link className={styles.Controls__brand} to={"/"}>
        <img src="/logo_mobile.svg" />
      </Link>
      <SearchInput />
      <button
        className={styles.Controls__filter}
        onClick={handleFilterButton}
        ref={filterButton}
      ></button>
      <button
        className={styles.Controls__addButton}
        onClick={handleAddButtonClick}
      >
        {mapMode === MapMode.Select || mapMode === MapMode.Add ? (
          "Save"
        ) : (
          <>
            <span className={styles.Controls__addButtonPlus}>+</span> Add place
          </>
        )}
      </button>

      <MapFilter
        className={styles.Controls__mapFilter}
        filterButton={filterButton}
      />
    </aside>
  );
};

export default Controls;
