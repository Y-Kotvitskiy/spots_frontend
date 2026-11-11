import React, { useState, useEffect, useMemo, useCallback } from "react";
import { AdvancedMarker, useMap } from "@vis.gl/react-google-maps";
import Supercluster from "supercluster";
import PlaceMarker from "./PlaceMarker"; // Ваш существующий компонент маркера
import type { Place } from "@/types";

interface PlacesClustererProps {
  places: Array<Place>;
}

export const PlacesClusterer: React.FC<PlacesClustererProps> = ({ places }) => {
  const map = useMap();
  const [zoom, setZoom] = useState<number>(12);
  const [bounds, setBounds] = useState<[number, number, number, number] | null>(
    null,
  );

  // 1. Превращаем ваши места в GeoJSON формат, который понимает supercluster
  const points = useMemo(() => {
    return places.map((place) => ({
      type: "Feature" as const,
      properties: {
        cluster: false,
        placeId: place.id,
        placeData: place, // Сохраняем оригинальный объект места
      },
      geometry: {
        type: "Point" as const,
        coordinates: [place.longitude, place.latitude], // Внимание: у GeoJSON порядок [долгота, широта]!
      },
    }));
  }, [places]);

  // 2. Инициализируем Supercluster
  const supercluster = useMemo(() => {
    const cluster = new Supercluster({
      radius: 50, // Радиус кластеризации в пикселях
      maxZoom: 20,
    });
    cluster.load(points);
    return cluster;
  }, [points]);

  // 3. Отслеживаем изменение зума и границ видимой области карты
  const handleCameraChange = useCallback(() => {
    if (!map) return;
    const mapBounds = map.getBounds();
    const currentZoom = map.getZoom();

    if (mapBounds && currentZoom !== undefined) {
      setZoom(currentZoom);
      const ne = mapBounds.getNorthEast();
      const sw = mapBounds.getSouthWest();
      // Supercluster ждет границы в формате [west, south, east, north]
      setBounds([sw.lng(), sw.lat(), ne.lng(), ne.lat()]);
    }
  }, [map]);

  useEffect(() => {
    if (!map) return;
    handleCameraChange();

    // Слушаем событие 'idle' (когда карта перестала двигаться/зумиться)
    const listener = map.addListener("idle", handleCameraChange);
    return () => {
      google.maps.event.removeListener(listener);
    };
  }, [map, handleCameraChange]);

  // 4. Вычисляем кластеры под текущий зум и границы
  const clusters = useMemo(() => {
    if (!bounds) return [];
    return supercluster.getClusters(bounds, Math.floor(zoom));
  }, [supercluster, bounds, zoom]);

  return (
    <>
      {clusters.map((cluster) => {
        const [longitude, latitude] = cluster.geometry.coordinates;
        const { cluster: isCluster, point_count: pointCount } =
          cluster.properties;

        // Если это группа точек (кластер)
        if (isCluster) {
          return (
            <AdvancedMarker
              key={`cluster-${cluster.id}`}
              position={{ lat: latitude, lng: longitude }}
              onClick={() => {
                // При клике на кластер приближаем карту до уровня его распада
                const expansionZoom = Math.min(
                  supercluster.getClusterExpansionZoom(cluster.id as number),
                  20,
                );
                map?.setZoom(expansionZoom);
                map?.panTo({ lat: latitude, lng: longitude });
              }}
            >
              {/* Кастомный визуальный вид кластера (можете вынести в SCSS модули) */}
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #4285F4, #1967D2)",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                  fontSize: "14px",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
                  cursor: "pointer",
                  border: "3px solid white",
                  transition: "transform 0.2s",
                }}
              >
                {pointCount}
              </div>
            </AdvancedMarker>
          );
        }

        // Если это единичный маркер — рендерим ваш родной компонент PlaceMarker
        const place = cluster.properties.placeData;
        return <PlaceMarker key={place.id} place={place} />;
      })}
    </>
  );
};
