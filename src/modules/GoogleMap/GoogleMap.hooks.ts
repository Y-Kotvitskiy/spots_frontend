import { mapActions } from "@/store";
import { useAppDispatch, useMapSelector } from "@/store/hooks";
import { fetchInitialData, selectIsPickingMode } from "@/store/slices/mapSlice";
import type { LocateState } from "@/types/locateState";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useParams } from "react-router-dom";

export function useGoogleMap(isVisible: boolean) {
  const isPickingMode = useSelector(selectIsPickingMode);
  const dispatch = useAppDispatch();
  const { status, savedPlaces, filters, selectedPlace } = useMapSelector();

  const { id: placeId } = useParams();
  const location = useLocation();
  const locationState = (location.state as LocateState | null) ?? null;

  const [isPlaceShareModalOpen, setIsPlaceShareModal] = useState(false);
  const [center, setCenter] = useState({ lat: 50.4501, lng: 30.5234 });
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);

  const isPickingModeRef = useRef(isPickingMode);

  // 1. Загрузка начальных данных
  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchInitialData());
    }
  }, [status, dispatch]);

  // 2. Якщо це запит на точку, знаходим точку і позіціонуем на неї
  //  Якщо точка вибрана, алє є timestamp, просто центруємо
  // Якщо місце вибрано, алє пусте, очищаємо selectedPlace

  useEffect(() => {
    if (!isVisible) return;

    if (
      selectedPlace &&
      selectedPlace?.id === locationState?.selectedPlaceId &&
      !locationState?.timestamp
    ) {
      return;
    }

    if (locationState && locationState.selectedPlaceId === null) {
      dispatch(mapActions.clearSelectedPlace());
      setIsLoadingLocation(false);
      return;
    }

    if (status !== "succeeded" || !savedPlaces.length || !placeId) return;

    const targetPlace =
      selectedPlace && locationState?.selectedPlaceId === selectedPlace?.id
        ? selectedPlace
        : savedPlaces.find((place) => String(place.id) === String(placeId));

    if (!targetPlace) {
      console.warn(`Маркер с id ${placeId} не найден`);
      return;
    }

    // Обновляем центр
    if (
      (selectedPlace === targetPlace && locationState?.timestamp) ||
      (targetPlace && !locationState)
    ) {
      setCenter({
        lat: targetPlace.latitude,
        lng: targetPlace.longitude,
      });
      setIsLoadingLocation(false);
    }

    if (!locationState?.selectedPlaceId) {
      dispatch(mapActions.setSelectedPlace(targetPlace));
    }
  }, [status, savedPlaces, placeId, locationState, selectedPlace, dispatch]);

  // Якщо перше завантаження, позиціонуем на місцезнаходження
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
  }, [placeId, isLoadingLocation, locationState, isVisible]);

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
