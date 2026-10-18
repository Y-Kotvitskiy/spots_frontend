import React, { useCallback, useState } from "react";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
  type MapMouseEvent,
} from "@vis.gl/react-google-maps";

interface LocationPoint {
  id: string;
  title: string;
  position: {
    lat: number;
    lng: number;
  };
}

// Тип для выбранной точки
interface SelectedPoint {
  lat: number;
  lng: number;
}

const locations: LocationPoint[] = [
  { id: "1", title: "Дом", position: { lat: 51.5139, lng: 31.3268 } },
];

const GoogleMap: React.FC = () => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string;
  const mapId = import.meta.env.VITE_MAP_ID as string;

  const [selectedPoint, setSelectedPoint] = useState<LocationPoint | null>(
    null,
  );

  // State для хранения выбранных координат
  const [selectedCoords, setSelectedCoords] = useState<SelectedPoint | null>(
    null,
  );

  // Обработчик клика по карте
  const handleMapClick = useCallback((event: MapMouseEvent) => {
    // В event.detail.latLng находятся точные координаты клика { lat, lng }
    if (!event.detail.latLng) return;

    const { lat, lng } = event.detail.latLng;
    setSelectedCoords({ lat, lng });

    console.log("Выбранные координаты:", { lat, lng });
  }, []);

  return (
    <APIProvider apiKey={apiKey}>
      <div style={{ width: "100%", height: "500px" }}>
        <Map
          defaultCenter={{ lat: 51.5139, lng: 31.3268 }}
          defaultZoom={13}
          mapId={mapId}
          gestureHandling={"greedy"}
        >
          {locations.map((loc) => (
            <AdvancedMarker
              key={loc.id}
              position={loc.position}
              onClick={() => setSelectedPoint(loc)}
            >
              <Pin
                background={"#ea4335"}
                glyphColor={"#fff"}
                borderColor={"#000"}
              />
            </AdvancedMarker>
          ))}

          {selectedPoint && (
            <InfoWindow
              position={selectedPoint.position}
              onCloseClick={() => setSelectedPoint(null)}
            >
              <div>
                <h3>{selectedPoint.title}</h3>
                <p>
                  Координаты: {selectedPoint.position.lat},{" "}
                  {selectedPoint.position.lng}
                </p>
              </div>
            </InfoWindow>
          )}
        </Map>
      </div>
    </APIProvider>
  );
};

export default GoogleMap;
