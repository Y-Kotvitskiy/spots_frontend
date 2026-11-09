import styles from "./GoogleMap.module.scss";

import React, { useCallback, useEffect } from "react";
import { Map, AdvancedMarker, Pin, useMap } from "@vis.gl/react-google-maps";
import type { MapMouseEvent } from "@vis.gl/react-google-maps";
import Controls from "./Controls";
import {
  fetchInitialData,
  selectIsPickingMode,
  selectSavedPlaces,
  selectSelectedCoords,
} from "@/store/slices/mapSlice";
import { useSelector } from "react-redux";
import { useAppDispatch } from "@/store/hooks";
import { mapActions } from "@/store";
import PlaceForm from "./PlaceForm";
import MapPlaceDetail from "./MapPlaceDetail";
import PlaceMarker from "./PlaceMarker";
import { useGoogleMap } from "./GoogleMap.hooks";

// ==========================================
// 1. Маркер для режима выбора (пин с возможностью перетаскивания)
// ==========================================
const MapMarker: React.FC = () => {
  const selectedCoords = useSelector(selectSelectedCoords);
  const dispatch = useAppDispatch();

  if (!selectedCoords) return null;

  return (
    <AdvancedMarker
      position={selectedCoords}
      draggable={true}
      onDragEnd={async (e) => {
        if (e.latLng) {
          const lat = e.latLng.lat();
          const lng = e.latLng.lng();

          dispatch(mapActions.setSelectedCoords({ lat, lng, address: "" }));
        }
      }}
    >
      <Pin background={"#ea4335"} glyphColor={"#fff"} />
    </AdvancedMarker>
  );
};

// ==========================================
// 3. Компонент управления курсором карты
// ==========================================
const MapCursorController: React.FC<{ cursorType: string }> = ({
  cursorType,
}) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    map.setOptions({ draggableCursor: cursorType });
  }, [map, cursorType]);

  return null;
};

const MapCenterController: React.FC<{
  center: { lat: number; lng: number };
}> = ({ center }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    map.setCenter(center);
  }, [map, center]);

  return null;
};

// ==========================================
// 4. Основной компонент карты
// ==========================================
export const GoogleMap: React.FC = () => {
  const mapId = import.meta.env.VITE_MAP_ID as string;

  const {
    isPickingMode,
    isPickingModeRef,
    isLoadingLocation,
    center,
    places,
    dispatch,
  } = useGoogleMap();

  const handleMapClick = useCallback(
    async (event: MapMouseEvent) => {
      if (!isPickingModeRef.current) {
        dispatch(mapActions.clearSelectedPlace());
        return;
      }

      if (event.detail.latLng) {
        const { lat, lng } = event.detail.latLng;
        // const address = await getAddressFromCoords(lat, lng);

        dispatch(mapActions.setSelectedCoords({ lat, lng, address: "" }));
      }
    },
    [dispatch],
  );

  return (
    <main className={styles.GoogleMap}>
      <Controls />
      <PlaceForm />
      <MapPlaceDetail />

      {isLoadingLocation && <div>Визначаємо ваше місцезнаходження...</div>}

      <div className={styles.GoogleMap__map}>
        <Map
          defaultCenter={center}
          defaultZoom={12}
          mapId={mapId}
          onClick={handleMapClick}
          clickableIcons={false}
          disableDefaultUI={true}
        >
          <MapCenterController center={center} />
          <MapCursorController
            cursorType={isPickingMode ? "crosshair" : "grab"}
          />

          {/* Маркер создания/выбора точки */}
          <MapMarker />

          {/* Маркеры из сохраненного списка */}
          {places.map((place) => (
            <PlaceMarker key={place.id} place={place} />
          ))}
        </Map>
      </div>
    </main>
  );
};

export default GoogleMap;
