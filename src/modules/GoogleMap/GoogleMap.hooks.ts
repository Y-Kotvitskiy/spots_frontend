import { mapActions } from "@/store";
import { useAppDispatch, useMapSelector } from "@/store/hooks";
import { fetchInitialData, selectIsPickingMode } from "@/store/slices/mapSlice";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useParams } from "react-router-dom";

export function useGoogleMap() {
  const isPickingMode = useSelector(selectIsPickingMode);
  const dispatch = useAppDispatch();
  const { status, savedPlaces, filters, selectedPlace } = useMapSelector();
  const { id: placeId } = useParams();
  const location = useLocation();
  const [isPlaceShareModalOpen, setIsPlaceShareModal] = useState(false);

  const [center, setCenter] = useState({ lat: 50.4501, lng: 30.5234 });
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);

  const isPickingModeRef = useRef(isPickingMode);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchInitialData());
    }
  }, [status, dispatch]);

  useEffect(() => {
    if (status === "succeeded" && savedPlaces.length > 0 && placeId) {
      if (placeId) {
        // Ищем нужный маркер
        const targetPlace = savedPlaces.find(
          (currentPlace) => String(currentPlace.id) === String(placeId),
        );

        if (targetPlace) {
          if (isLoadingLocation) {
            setIsLoadingLocation(false);
          }

          if (targetPlace !== selectedPlace) {
            dispatch(mapActions.setSelectedPlace(targetPlace));
          }

          setCenter({
            lat: targetPlace.latitude,
            lng: targetPlace.longitude,
          });
        } else {
          console.warn(`Маркер с id ${placeId} не найден в данных`);
        }
      } else {
        // Если ID в URL нет, можно показать общую карту или дефолтный вид
      }
    }
  }, [status, savedPlaces, placeId, location.state]);

  useEffect(() => {
    isPickingModeRef.current = isPickingMode;
  }, [isPickingMode]);

  useEffect(() => {
    if (!isLoadingLocation) return;

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (isLoadingLocation) {
            setCenter({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
            setIsLoadingLocation(false);
          }
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
  }, [placeId, isLoadingLocation]);

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

  const openPlaceShareModal = () => setIsPlaceShareModal(true);
  const closePlaceShareModal = () => setIsPlaceShareModal(false);

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
