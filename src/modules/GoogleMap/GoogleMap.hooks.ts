import { mapActions } from "@/store";
import { useAppDispatch, useMapSelector } from "@/store/hooks";
import { fetchInitialData, selectIsPickingMode } from "@/store/slices/mapSlice";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useParams } from "react-router-dom";

export function useGoogleMap(isVisible: boolean) {
  const isPickingMode = useSelector(selectIsPickingMode);
  const dispatch = useAppDispatch();
  const { status, savedPlaces, filters, selectedPlace } = useMapSelector();

  const { id: placeId } = useParams();
  const location = useLocation();
  const locationState = location.state; // берём только state, а не весь location

  const [isPlaceShareModalOpen, setIsPlaceShareModal] = useState(false);
  const [center, setCenter] = useState({ lat: 50.4501, lng: 30.5234 });
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);

  const isPickingModeRef = useRef(isPickingMode);

  useEffect(() => {
    console.log("[useGoogleMap] mount");

    return () => {
      console.log("[useGoogleMap] unmount");
    };
  }, []);

  // 1. Загрузка начальных данных
  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchInitialData());
    }
  }, [status, dispatch]);

  // 2. Синхронизация placeId → selectedPlace + center
  useEffect(() => {
    if (status !== "succeeded" || !savedPlaces.length || !placeId) return;

    const targetPlace = savedPlaces.find(
      (place) => String(place.id) === String(placeId),
    );

    if (!targetPlace) {
      console.warn(`Маркер с id ${placeId} не найден`);
      return;
    }

    // Если место уже выбрано — ничего не делаем
    if (selectedPlace?.id === targetPlace.id) {
      // только обновляем center, если нужно
      setCenter({
        lat: targetPlace.latitude,
        lng: targetPlace.longitude,
      });
      setIsLoadingLocation(false);
      return;
    }

    dispatch(mapActions.setSelectedPlace(targetPlace));
    setCenter({
      lat: targetPlace.latitude,
      lng: targetPlace.longitude,
    });
    setIsLoadingLocation(false);
  }, [status, savedPlaces, placeId, selectedPlace, dispatch]);

  useEffect(() => {
    if (!isVisible) return;

    if (!isLoadingLocation || placeId) return;

    if (!("geolocation" in navigator)) {
      setIsLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCenter({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setIsLoadingLocation(false);
      },
      (error) => {
        console.warn("Не вдалося отримати геолокацію:", error.message);
        setIsLoadingLocation(false);
      },
      { timeout: 10000 },
    );

    // getCurrentPosition не возвращает id, но для ясности
    return () => {
      // ничего чистить не нужно
    };
  }, [placeId, isLoadingLocation, locationState]);

  // 4. Синхронизация ref
  useEffect(() => {
    isPickingModeRef.current = isPickingMode;
  }, [isPickingMode]);

  // 5. Фильтрация мест
  const places = useMemo(() => {
    const { categories, tags } = filters;

    return savedPlaces.filter((place) => {
      const matchCategory =
        categories.length === 0 || categories.includes(place.categoryId);
      const matchTags =
        tags.length === 0 || tags.every((t) => place.tags?.includes(t));

      return matchCategory && matchTags;
    });
  }, [savedPlaces, filters]);

  // 6. Стабильные колбэки
  const openPlaceShareModal = useCallback(() => {
    setIsPlaceShareModal(true);
  }, []);

  const closePlaceShareModal = useCallback(() => {
    setIsPlaceShareModal(false);
  }, []);

  return {
    isPickingMode,
    isPickingModeRef,
    isLoadingLocation,
    center,
    places,
    isPlaceShareModalOpen,
    openPlaceShareModal,
    closePlaceShareModal,
    dispatch,
  };
}
