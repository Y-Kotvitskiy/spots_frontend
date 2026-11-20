import styles from "./Controls.module.scss";
import cn from "classnames";
import { Link } from "react-router-dom";
import SearchInput from "./SearchInput";
import { MapMode, selectSelectedCoords } from "@/store/slices/mapSlice";
import { useSelector } from "react-redux";
import { useAppDispatch, useMapSelector } from "@/store/hooks";
import { mapActions } from "@/store";
import { useMap } from "@vis.gl/react-google-maps";
import MapFilter from "./MapFilter";
import { useRef } from "react";
import { useSelectPlace } from "../GoogleMap.hooks";

const Controls: React.FC = () => {
  const { mapMode, filters, categories } = useMapSelector();
  const selectedCoords = useSelector(selectSelectedCoords);
  const dispatch = useAppDispatch();
  const filterButton = useRef<HTMLButtonElement>(null);
  const selectPlace = useSelectPlace();

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
      selectPlace("");
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
      selectPlace("");
    } else {
      dispatch(mapActions.setMapMode(MapMode.Show));
    }
  };

  const isAddingMode = mapMode === MapMode.Select || mapMode === MapMode.Add;
  const hasActiveFilters = filters.categories.length || filters.tags.length;
  const filterButtonTitle =
    (filters.categories.length
      ? "categories: " +
        filters.categories.map((id) => categories[id]).join(",")
      : "") + (filters.tags.length ? " tags: " + filters.tags.join(",") : "");

  return (
    <aside className={styles.Controls}>
      <Link className={styles.Controls__brand} to={"/"}>
        <img src="/logo_mobile.svg" />
      </Link>

      <SearchInput />

      <button
        className={cn(styles.Controls__filter, {
          [styles.Controls__filter_selected]:
            hasActiveFilters || mapMode === MapMode.Filter,
        })}
        onClick={handleFilterButton}
        ref={filterButton}
        title={filterButtonTitle}
      ></button>
      <button
        className={cn(styles.Controls__addButton, {
          [styles.Controls__addButton_save]: isAddingMode,
        })}
        onClick={handleAddButtonClick}
      >
        {isAddingMode ? (
          <>
            <span className={styles.Controls__addButtonPlay}>&#9655;</span>
            <span className={styles.Controls__addButtonText}>Save</span>
          </>
        ) : (
          <>
            <span className={styles.Controls__addButtonPlus}>+</span>
            <span className={styles.Controls__addButtonText}>Add place</span>
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
