import { Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import type { ReactNode } from "react";

type MapPointWidgetProps = {
  lat: number;
  lng: number;
  zoom?: number;
  height?: number | string;
  title?: string;
  children: ReactNode;
  onMarkerClick: () => void;
};

export function MapPreview({
  lat,
  lng,
  zoom = 15,
  height = 240,
  title,
  children,
  onMarkerClick,
}: MapPointWidgetProps) {
  const position = { lat, lng };

  return (
    <div
      style={{ width: "100%", height, borderRadius: 12, overflow: "hidden" }}
    >
      <Map
        mapId="YOUR_MAP_ID"
        center={position}
        zoom={zoom}
        gestureHandling="none"
        disableDefaultUI
        clickableIcons={false}
      >
        <AdvancedMarker
          position={position}
          title={title}
          onClick={onMarkerClick}
        >
          {children}
        </AdvancedMarker>
      </Map>
    </div>
  );
}

export default MapPreview;
