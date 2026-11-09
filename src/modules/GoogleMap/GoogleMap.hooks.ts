import { useAppDispatch, useMapSelector } from "@/store/hooks";
import {
  fetchInitialData,
  selectIsPickingMode,
  selectSavedPlaces,
} from "@/store/slices/mapSlice";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";

export function useGoogleMap() {
  const isPickingMode = useSelector(selectIsPickingMode);
  const dispatch = useAppDispatch();
  const { savedPlaces, filters } = useMapSelector();

  const [center, setCenter] = useState({ lat: 50.4501, lng: 30.5234 });
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);

  const isPickingModeRef = useRef(isPickingMode);

  useEffect(() => {
    dispatch(fetchInitialData());
  }, []);

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
          console.warn("Не вдалося отримати геолокацію:", error.message);
          setIsLoadingLocation(false); // Остаемся на дефолтных координатах
        },
        { timeout: 10000 },
      );
    } else {
      setIsLoadingLocation(false);
    }
  }, []);

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

  return {
    isPickingMode,
    isPickingModeRef,
    isLoadingLocation,
    center,
    places,
    dispatch,
  };
}
