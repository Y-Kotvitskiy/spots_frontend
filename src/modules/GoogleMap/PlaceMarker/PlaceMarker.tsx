import type { Place } from "@/types";
import { AdvancedMarker } from "@vis.gl/react-google-maps";
import { memo } from "react";
import PlaceIcon from "@/modules/shared/PlaceIcon/PlaceIcon";
import { useSelectPlace } from "../GoogleMap.hooks";

interface PlaceMarkerProps {
  place: Place;
  isSelected: boolean;
}

const PlaceMarker: React.FC<PlaceMarkerProps> = memo(
  ({ place, isSelected }) => {
    const selectPlace = useSelectPlace();
    return (
      <AdvancedMarker
        position={{ lat: place.latitude, lng: place.longitude }}
        title={place.name}
        onClick={(event) => {
          event.stopPropagation();
          selectPlace(place.id);
        }}
      >
        <PlaceIcon categoryName={place.categoryName} isSelected={isSelected} />
      </AdvancedMarker>
    );
  },
);

PlaceMarker.displayName = "PlaceMarker";

export default PlaceMarker;
