import styles from "./GoogleMap.module.scss";

import React, { useCallback, useEffect, useRef, memo } from "react";
import {
  Map,
  AdvancedMarker,
  Pin,
  useMap,
  InfoWindow,
} from "@vis.gl/react-google-maps";
import type { MapMouseEvent } from "@vis.gl/react-google-maps";
import Controls from "./Controls";
import { getAddressFromCoords } from "./utils";
import {
  selectIsPickingMode,
  selectSavedPlaces,
  selectSelectedCoords,
  selectSelectedPlaces,
} from "@/store/mapSlice";
import { useSelector } from "react-redux";
import { useAppDispatch } from "@/store/hooks";
import { mapActions } from "@/store";
import type { Place } from "@/types";
import PlaceForm from "./PlaceForm";

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
          const address = await getAddressFromCoords(lat, lng);

          dispatch(mapActions.setSelectedCoords({ lat, lng, address }));
        }
      }}
    >
      <Pin background={"#ea4335"} glyphColor={"#fff"} />
    </AdvancedMarker>
  );
};

// ==========================================
// 2. Отдельный компонент для маркеров из списка places (оптимизирован через memo)
// ==========================================
interface PlaceMarkerProps {
  place: Place;
}

const PlaceMarker: React.FC<PlaceMarkerProps> = memo(({ place }) => {
  const dispatch = useAppDispatch();

  return (
    <AdvancedMarker
      position={{ lat: place.latitude, lng: place.longitude }}
      title={place.name}
      onClick={() => dispatch(mapActions.setSelectedPlace(place))}
    >
      <svg
        width="34"
        height="47"
        viewBox="0 0 68 94"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          transform: "translate(-50%, -100%)",
          cursor: "pointer",
          filter: "drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.25))",
        }}
      >
        <path
          d="M34 0C15.2223 0 0 15.2026 0 33.9559C0 43.5488 3.98307 52.2126 10.3876 58.3877C23.0147 72.2441 29.1483 80.0292 34 94C38.5249 81.1967 43.862 73.3518 57.6124 58.3877C64.0169 52.2126 68 43.5488 68 33.9559C68 15.2026 52.7777 0 34 0Z"
          fill="#239616"
        />
        <rect
          x="5.80493"
          y="5.80518"
          width="56.3902"
          height="56.3902"
          rx="28.1951"
          fill="white"
        />
        <path
          d="M30.5372 47.2688H27.8306V45.2702H30.5372V32.8452L27.366 30.7377L28.2952 29.0249L31.4655 31.1314C31.7321 31.3097 31.9528 31.561 32.1062 31.8612C32.2596 32.1614 32.3407 32.5002 32.3416 32.8452V45.2702C32.3416 45.8003 32.1515 46.3086 31.8131 46.6834C31.4747 47.0582 31.0157 47.2688 30.5372 47.2688Z"
          fill="#239616"
        />
        <path
          d="M40.3882 47.2689H37.4397C36.9184 47.2689 36.4185 47.0567 36.0498 46.679C35.6812 46.3013 35.4741 45.789 35.4741 45.2549V34.1783H41.371C41.9201 34.1784 42.4632 34.0606 42.9652 33.8325C43.4672 33.6044 43.917 33.2711 44.2856 32.8541C44.6542 32.4371 44.9334 31.9455 45.1053 31.4112C45.2772 30.8768 45.3379 30.3115 45.2836 29.7516C45.1518 28.7331 44.6585 27.8 43.8977 27.1305C43.137 26.4611 42.1623 26.1022 41.1597 26.1225H39.6039L39.4299 25.3381C38.8668 22.7955 36.4874 21.0877 33.5085 21.0877C32.3837 21.0914 31.2832 21.4237 30.3361 22.0454C29.389 22.6671 28.6345 23.5526 28.161 24.598L27.8573 25.2696L27.0092 25.1548C26.8833 25.1333 26.7563 25.1202 26.6288 25.1155C25.5862 25.1155 24.5862 25.5399 23.849 26.2953C23.1117 27.0507 22.6976 28.0752 22.6976 29.1434C22.6976 30.2117 23.1117 31.2362 23.849 31.9916C24.5862 32.7469 25.5862 33.1713 26.6288 33.1713V35.1852C25.0649 35.1852 23.565 34.5487 22.4591 33.4156C21.3532 32.2826 20.7319 30.7458 20.7319 29.1434C20.7319 27.541 21.3532 26.0043 22.4591 24.8712C23.565 23.7382 25.0649 23.1016 26.6288 23.1016L26.7064 23.1026C27.3981 21.8809 28.39 20.8661 29.5834 20.1593C30.7767 19.4524 32.13 19.0781 33.5085 19.0737C37.1242 19.0737 40.0855 21.0655 41.1272 24.1086H41.1597C42.6503 24.0915 44.0948 24.6382 45.2167 25.6441C46.3385 26.6499 47.059 28.0442 47.2403 29.5603C47.3207 30.3995 47.2287 31.2467 46.9704 32.0473C46.712 32.8479 46.2929 33.5842 45.74 34.2089C45.1872 34.8335 44.5128 35.3327 43.7604 35.6743C43.0079 36.0159 42.194 36.1923 41.371 36.1922H37.4397V45.2549H40.3882V47.2689Z"
          fill="#239616"
        />
      </svg>
    </AdvancedMarker>
  );
});

PlaceMarker.displayName = "PlaceMarker";

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
  const selectedPlace = useSelector(selectSelectedPlaces);

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
      }
    },
    [dispatch],
  );

  return (
    <main className={styles.GoogleMap}>
      <Controls />
      <PlaceForm />

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

          {/* Маркер создания/выбора точки */}
          <MapMarker />

          {/* Маркеры из сохраненного списка */}
          {places.map((place) => (
            <PlaceMarker key={place.id} place={place} />
          ))}

          {selectedPlace && (
            <InfoWindow
              position={{
                lat: selectedPlace.latitude,
                lng: selectedPlace.longitude,
              }}
              onCloseClick={() => dispatch(mapActions.clearSelectedPlace())}
            >
              <div style={{ padding: "4px" }}>
                <h4 style={{ margin: "0 0 6px 0", color: "#333" }}>
                  {selectedPlace.name}!!!
                </h4>
                <p style={{ margin: 0, fontSize: "14px", color: "#666" }}>
                  {selectedPlace.description}
                </p>
              </div>
            </InfoWindow>
          )}
        </Map>
      </div>
    </main>
  );
};

export default GoogleMap;
