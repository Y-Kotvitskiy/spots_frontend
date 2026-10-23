import styles from "./GoogleMap.module.scss";

import React, { useState, useCallback, useEffect } from "react";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  useMap,
} from "@vis.gl/react-google-maps";
import type { MapMouseEvent } from "@vis.gl/react-google-maps";
import Controls from "./Controls";

interface SelectedPoint {
  lat: number;
  lng: number;
}

// 1. Объявляем вспомогательный компонент для управления курсором карты
const MapCursorController: React.FC<{ cursorType: string }> = ({
  cursorType,
}) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    // Устанавливаем стиль курсора через стандартный API Google Maps
    map.setOptions({ draggableCursor: cursorType });
  }, [map, cursorType]);

  return null;
};

// 2. Основной компонент карты
export const GoogleMap: React.FC = () => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string;
  const mapId = import.meta.env.VITE_MAP_ID as string;

  const [selectedCoords, setSelectedCoords] = useState<SelectedPoint | null>(
    null,
  );

  const handleMapClick = useCallback((event: MapMouseEvent) => {
    if (event.detail.latLng) {
      const { lat, lng } = event.detail.latLng;
      setSelectedCoords({ lat, lng });
      console.log("Выбранные координаты:", { lat, lng });
    }
  }, []);

  return (
    <APIProvider apiKey={apiKey}>
      <main className={styles.GoogleMap}>
        <Controls />
        {selectedCoords ? (
          <div>
            <b>Широта:</b> {selectedCoords.lat.toFixed(6)} | <b>Долгота:</b>{" "}
            {selectedCoords.lng.toFixed(6)}
          </div>
        ) : (
          <div>Кликните по карте, чтобы выбрать точку</div>
        )}
        <div className={styles.GoogleMap__map}>
          <Map
            defaultCenter={{ lat: 50.4501, lng: 30.5234 }}
            defaultZoom={12}
            mapId={mapId}
            onClick={handleMapClick}
            clickableIcons={false}
          >
            {/* Устанавливаем курсор 'crosshair' (крестик) или 'pointer' (ручка) */}
            <MapCursorController cursorType="crosshair" />

            {selectedCoords && (
              <AdvancedMarker
                position={selectedCoords}
                draggable={true}
                onDragEnd={(e) => {
                  if (e.detail.latLng) {
                    setSelectedCoords(e.detail.latLng);
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
