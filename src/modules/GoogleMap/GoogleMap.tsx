import styles from "./GoogleMap.module.scss";

import React, { useCallback, useEffect, useRef } from "react";
import { Map, AdvancedMarker, Pin, useMap } from "@vis.gl/react-google-maps";
import type { MapMouseEvent } from "@vis.gl/react-google-maps";
import Controls from "./Controls";
import { getAddressFromCoords } from "./utils";
import { selectIsPickingMode, selectSelectedCoords } from "@/store/mapSlice";
import { useSelector } from "react-redux";
import { useAppDispatch } from "@/store/hooks";
import { mapActions } from "@/store";

// 1. Отдельный изолированный компонент для маркера
const MapMarker: React.FC = () => {
  const selectedCoords = useSelector(selectSelectedCoords);
  const dispatch = useAppDispatch();

  if (!selectedCoords) return null;

  return (
    <AdvancedMarker
      position={selectedCoords}
      draggable={true}
      onDragEnd={(e) => {
        if (e.latLng) {
          const point = {
            lat: e.latLng.lat(),
            lng: e.latLng.lng(),
            address: "",
          };
          dispatch(mapActions.setSelectedCoords(point));
        }
      }}
    >
      <Pin background={"#ea4335"} glyphColor={"#fff"} />
    </AdvancedMarker>
  );
};

// 2. Компонент управления курсором
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

// 3. Основной компонент карты
export const GoogleMap: React.FC = () => {
  const mapId = import.meta.env.VITE_MAP_ID as string;
  const isPickingMode = useSelector(selectIsPickingMode);
  const dispatch = useAppDispatch();

  // Храним актуальный isPickingMode в ref, чтобы не пересоздавать обработчик клика
  const isPickingModeRef = useRef(isPickingMode);
  useEffect(() => {
    isPickingModeRef.current = isPickingMode;
  }, [isPickingMode]);

  const handleMapClick = useCallback(
    async (event: MapMouseEvent) => {
      if (!isPickingModeRef.current) return;

      if (event.detail.latLng) {
        const { lat, lng } = event.detail.latLng;
        const address = await getAddressFromCoords(lat, lng);

        dispatch(mapActions.setSelectedCoords({ lat, lng, address }));
        console.log("Выбранные координаты:", { lat, lng, address });
      }
    },
    [dispatch], // Теперь функция стабильна и никогда не меняет ссылку
  );

  return (
    <main className={styles.GoogleMap}>
      <Controls />

      <div className={styles.GoogleMap__map}>
        <Map
          defaultCenter={{ lat: 50.4501, lng: 30.5234 }}
          defaultZoom={12}
          mapId={mapId}
          onClick={handleMapClick}
          clickableIcons={false}
          disableDefaultUI={true}
        >
          <MapCursorController
            cursorType={isPickingMode ? "crosshair" : "grab"}
          />

          {/* Рендерим изолированный маркер */}
          <MapMarker />
        </Map>
      </div>
    </main>
  );
};

export default GoogleMap;
