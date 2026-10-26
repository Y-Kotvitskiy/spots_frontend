import styles from "./Controls.module.scss";
import { Link } from "react-router-dom";
import SearchInput from "./SearchInput";
import {
  MapMode,
  selectIsPickingMode,
  selectMapMode,
  selectSelectedCoords,
} from "@/store/mapSlice";
import { useSelector } from "react-redux";
import { useAppDispatch } from "@/store/hooks";
import { mapActions } from "@/store";
import { getAddressFromCoords } from "../utils";
import { useMap } from "@vis.gl/react-google-maps";
import SavePlaceForm from "./PlaceForm";
import MapPlaceDetail from "./MapPlaceDetail";

const Controls: React.FC = () => {
  const mapMode = useSelector(selectMapMode);
  const selectedCoords = useSelector(selectSelectedCoords);
  const dispatch = useAppDispatch();

  const map = useMap();

  const putMarkerToCenter = async () => {
    debugger;
    if (map) {
      const center = map.getCenter();

      if (center) {
        const lat = center.lat();
        const lng = center.lng();
        const address = await getAddressFromCoords(lat, lng);

        console.log({ lat, lng, address });
        dispatch(mapActions.setSelectedCoords({ lat, lng, address }));
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
        {mapMode === MapMode.Select && "Save"}
        {mapMode === MapMode.Show && (
          <>
            <span className={styles.Controls__addButtonPlus}>+</span> Add place
          </>
        )}
      </button>
      <MapPlaceDetail />
      <SavePlaceForm />
    </aside>
  );
};

export default Controls;
