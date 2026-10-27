import styles from "./GoogleMap.module.scss";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Map, AdvancedMarker, Pin, useMap } from "@vis.gl/react-google-maps";
import type { MapMouseEvent } from "@vis.gl/react-google-maps";
import Controls from "./Controls";
import {
  selectIsPickingMode,
  selectSavedPlaces,
  selectSelectedCoords,
} from "@/store/mapSlice";
import { useSelector } from "react-redux";
import { useAppDispatch } from "@/store/hooks";
import { mapActions } from "@/store";
import PlaceForm from "./PlaceForm";
import MapPlaceDetail from "./MapPlaceDetail";
import PlaceMarker from "./PlaceMarker";

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

// ==========================================
// 4. Основной компонент карты
// ==========================================
export const GoogleMap: React.FC = () => {
  const mapId = import.meta.env.VITE_MAP_ID as string;
  const isPickingMode = useSelector(selectIsPickingMode);
  const dispatch = useAppDispatch();
  const places = useSelector(selectSavedPlaces);

  const [center, setCenter] = useState({ lat: 50.4501, lng: 30.5234 });
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);

  const isPickingModeRef = useRef(isPickingMode);
  useEffect(() => {
    isPickingModeRef.current = isPickingMode;
  }, [isPickingMode]);

  // 2. Запрашиваем геолокацию при монтировании
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setIsLoadingLocation(false);
        },
        (error) => {
          console.warn("Не удалось получить геолокацию:", error.message);
          setIsLoadingLocation(false); // Остаемся на дефолтных координатах
        },
        { timeout: 10000 },
      );
    } else {
      setIsLoadingLocation(false);
    }
  }, []);

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

      {isLoadingLocation && <div>Определяем ваше местоположение...</div>}

      <div className={styles.GoogleMap__map}>
        <Map
          defaultCenter={center}
          defaultZoom={12}
          mapId={mapId}
          onClick={handleMapClick}
          clickableIcons={false}
          disableDefaultUI={true}
        >
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
