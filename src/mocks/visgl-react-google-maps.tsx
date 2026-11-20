import React, { createContext, useContext, useMemo } from "react";

// Фейковый объект map с теми методами, которые ты вызываешь
const fakeMap = {
  setOptions: (o: unknown) => console.log("[mock] map.setOptions", o),
  setCenter: (c: unknown) => console.log("[mock] map.setCenter", c),
};

const MapContext = createContext<typeof fakeMap | null>(null);

export const useMap = () => useContext(MapContext);

export const APIProvider: React.FC<React.PropsWithChildren<any>> = ({
  children,
}) => <>{children}</>;

export const Map: React.FC<React.PropsWithChildren<any>> = ({
  children,
  onClick,
  ...rest
}) => {
  console.log("[mock] <Map> render");
  const value = useMemo(() => fakeMap, []);

  return (
    <MapContext.Provider value={value}>
      <div
        data-testid="fake-map"
        style={{ width: "100%", height: "100%", background: "#dde" }}
        onClick={(e) => {
          // эмуляция клика по карте
          onClick?.({
            detail: { latLng: { lat: 50.45, lng: 30.52 } },
          });
        }}
      >
        {children}
      </div>
    </MapContext.Provider>
  );
};

export const AdvancedMarker: React.FC<React.PropsWithChildren<any>> = ({
  children,
  position,
}) => {
  console.log("[mock] <AdvancedMarker> render", position);
  return <div data-marker>{children}</div>;
};

export const Pin: React.FC<any> = () => <span>📍</span>;

export const Marker = AdvancedMarker;
export const InfoWindow: React.FC<React.PropsWithChildren<any>> = ({
  children,
}) => <div>{children}</div>;

// Если используешь useMapsLibrary / useApiIsLoaded и т.п.
export const useMapsLibrary = () => null;
export const useApiIsLoaded = () => true;

export type MapMouseEvent = any;
