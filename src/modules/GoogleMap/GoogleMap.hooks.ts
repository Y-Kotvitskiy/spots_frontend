import { useAppDispatch, useMapSelector } from "@/store/hooks";
import { fetchInitialData, selectIsPickingMode } from "@/store/slices/mapSlice";
import { useMap } from "@vis.gl/react-google-maps";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

export function useSelectPlace() {
  const navigate = useNavigate();
  return useCallback(
    (id: string | number) => navigate(`/map/${id}`),
    [navigate],
  );
}

const DEFAULT_CENTER = { lat: 50.4501, lng: 30.5234 };

export function useGoogleMap(isVisible: boolean) {
  const wasVisibleRef = useRef(isVisible);
  const map = useMap("main-map");
  const navigate = useNavigate();
  const [initialCenter, setInitialCenter] = useState(DEFAULT_CENTER);
  const isPickingMode = useSelector(selectIsPickingMode);
  const dispatch = useAppDispatch();
  const { status, savedPlaces, filters } = useMapSelector();

  const { id: placeId } = useParams();

  const [isPlaceShareModalOpen, setIsPlaceShareModal] = useState(false);
  //  const [center, setCenter] = useState({ lat: 50.4501, lng: 30.5234 });
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);

  const isPickingModeRef = useRef(isPickingMode);

  // 1. Загрузка начальных данных
  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchInitialData());
    }
  }, [status, dispatch]);

  // Единственный источник правды о выборе: URL.
  const selectedPlace = useMemo(
    () => savedPlaces.find((p) => String(p.id) === placeId) ?? null,
    [savedPlaces, placeId],
  );

  useEffect(() => {
    const justShown = isVisible && !wasVisibleRef.current;
    wasVisibleRef.current = isVisible;

    if (!justShown || !selectedPlace || !map) return;

    const raf = requestAnimationFrame(() => {
      google.maps.event.trigger(map, "resize");
      map.panTo({
        lat: selectedPlace.latitude,
        lng: selectedPlace.longitude,
      });
    });
    return () => cancelAnimationFrame(raf);
  }, [isVisible, map]);

  // 1. Начальная загрузка данных
  useEffect(() => {
    if (status === "idle") dispatch(fetchInitialData());
  }, [status, dispatch]);

  // 2. Начальная позиция (только до первого показа карты).
  //    Есть placeId -> ждём данные и берём координаты точки.
  //    Нет placeId -> геолокация.
  const isDataReady = status === "succeeded";
  const isDataFailed = status === "failed";

  useEffect(() => {
    if (!isVisible || !isLoadingLocation) return;

    if (placeId) {
      // 1. Ждём загрузки: ничего не ищем и ничего не решаем
      if (!isDataReady && !isDataFailed) return;

      // 2. Загрузка упала: показываем карту с центром по умолчанию
      if (isDataFailed) {
        setIsLoadingLocation(false);
        return;
      }

      // 3. Данные готовы: теперь можно искать точку
      if (selectedPlace) {
        if (map) {
          map.panTo({
            lat: selectedPlace.latitude,
            lng: selectedPlace.longitude,
          });
        } else {
          setInitialCenter({
            lat: selectedPlace.latitude,
            lng: selectedPlace.longitude,
          });
        }
        setIsLoadingLocation(false);
      } else {
        console.warn(`Маркер с id ${placeId} не найден`);
        // Не сбрасываем isLoadingLocation: после редиректа placeId станет
        // undefined, эффект перезапустится и пойдёт в ветку геолокации.
        navigate("/map", { replace: true });
      }
      return;
    }

    // Нет placeId -> геолокация
    if (!("geolocation" in navigator)) {
      setIsLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        if (map) {
          map.panTo({
            lat: coords.latitude,
            lng: coords.longitude,
          });
        } else {
          setInitialCenter({ lat: coords.latitude, lng: coords.longitude });
        }
        setIsLoadingLocation(false);
      },
      (error) => {
        console.warn("Не вдалося отримати геолокацію:", error.message);
        setIsLoadingLocation(false);
      },
      { timeout: 10000 },
    );
  }, [
    map,
    isVisible,
    isLoadingLocation,
    placeId,
    selectedPlace,
    isDataReady,
    isDataFailed,
    navigate,
  ]);

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
    initialCenter,
    selectedPlace,
    places,
    isPlaceShareModalOpen,
    openPlaceShareModal,
    closePlaceShareModal,
    dispatch,
  };
}
