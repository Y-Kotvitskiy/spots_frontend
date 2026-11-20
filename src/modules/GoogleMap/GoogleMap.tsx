import styles from "./GoogleMap.module.scss";

import React, { useCallback, useEffect } from "react";
import { Map, AdvancedMarker, Pin, useMap } from "@vis.gl/react-google-maps";
import type { MapMouseEvent } from "@vis.gl/react-google-maps";
import Controls from "./Controls";
import { selectSelectedCoords } from "@/store/slices/mapSlice";
import { useSelector } from "react-redux";
import { useAppDispatch } from "@/store/hooks";
import { mapActions } from "@/store";
import PlaceForm from "./PlaceForm";
import MapPlaceDetail from "./MapPlaceDetail";
import { useGoogleMap } from "./GoogleMap.hooks";
import { PlacesClusterer } from "./PlacesClusterer";
import PlaceShareModal from "./PlaceShareModal";
import { useNavigate } from "react-router-dom";

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
export const GoogleMap: React.FC<{ isVisible: boolean }> = ({ isVisible }) => {
  const mapId = import.meta.env.VITE_MAP_ID as string;
  const navigate = useNavigate();

  const {
    isPickingMode,
    isPickingModeRef,
    isLoadingLocation,
    initialCenter,
    selectedPlace,
    places,
    isPlaceShareModalOpen,
    openPlaceShareModal,
    closePlaceShareModal,
    dispatch,
  } = useGoogleMap(isVisible);

  const handleMapClick = useCallback(
    async (event: MapMouseEvent) => {
      if (!isPickingModeRef.current) {
        navigate("/map");
        return;
      }

      if (event.detail.latLng) {
        const { lat, lng } = event.detail.latLng;

        dispatch(mapActions.setSelectedCoords({ lat, lng, address: "" }));
      }
    },
    [dispatch],
  );

  return (
    <main className={styles.GoogleMap}>
      <Controls />
      <PlaceForm />
      {selectedPlace && isVisible && (
        <MapPlaceDetail
          selectedPlace={selectedPlace}
          openPlaceShareModal={openPlaceShareModal}
        />
      )}
      <PlaceShareModal
        isOpen={isPlaceShareModalOpen}
        onClose={closePlaceShareModal}
        PlaceId={selectedPlace?.id}
      />

      {isLoadingLocation && <div>Визначаємо ваше місцезнаходження...</div>}

      <div className={styles.GoogleMap__map}>
        <Map
          id="main-map"
          defaultCenter={initialCenter}
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
          <PlacesClusterer
            places={places}
            selectedPlaceId={selectedPlace?.id}
          />
        </Map>
      </div>
    </main>
  );
};

export default GoogleMap;
