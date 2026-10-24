import styles from "./GoogleMap.module.scss";

import React, { useCallback, useEffect } from "react";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  useMap,
} from "@vis.gl/react-google-maps";
import type { MapMouseEvent } from "@vis.gl/react-google-maps";
import Controls from "./Controls";
import { getAddressFromCoords } from "./utils";
import { selectIsPickingMode, selectSelectedCoords } from "@/store/mapSlice";
import { useSelector } from "react-redux";
import { useAppDispatch } from "@/store/hooks";
import { mapActions } from "@/store";

export interface SelectedPoint {
  lat: number;
  lng: number;
  address?: string;
}

// 1. Вспомогательный компонент для управления курсором карты
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

// 2. Основной компонент карты
export const GoogleMap: React.FC = () => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string;
  const mapId = import.meta.env.VITE_MAP_ID as string;

  const isPickingMode = useSelector(selectIsPickingMode);
  const selectedCoords = useSelector(selectSelectedCoords);
  const dispatch = useAppDispatch();

  const handleMapClick = useCallback(
    async (event: MapMouseEvent) => {
      // Клик обрабатываем только если режим выбора активен
      if (!isPickingMode) return;

      if (event.detail.latLng) {
        const { lat, lng } = event.detail.latLng;
        const address = await getAddressFromCoords(lat, lng);

        dispatch(mapActions.setSelectedCoords({ lat, lng, address }));
        console.log("Выбранные координаты:", { lat, lng, address });

        // Опционально: можно автоматически выключать режим после выбора точки
        // setIsPickingMode(false);
      }
    },
    [isPickingMode],
  );

  return (
    <APIProvider apiKey={apiKey}>
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
            {/* Динамический курсор: крестик, если режим активен, иначе стандартный */}
            <MapCursorController
              cursorType={isPickingMode ? "crosshair" : "grab"}
            />

            {selectedCoords && (
              <AdvancedMarker
                position={selectedCoords}
                draggable={true}
                onDragEnd={(e) => {
                  if (e.latLng) {
                    const point = {
                      lat: e.latLng.lat(),
                      lng: e.latLng.lng(),
                    };
                    dispatch(mapActions.setSelectedCoords(point));
                  }
                }}
              >
                <Pin background={"#ea4335"} glyphColor={"#fff"} />
              </AdvancedMarker>
            )}
          </Map>
        </div>
      </main>
    </APIProvider>
  );
};

export default GoogleMap;
