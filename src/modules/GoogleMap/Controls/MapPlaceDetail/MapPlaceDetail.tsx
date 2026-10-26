import { selectSelectedPlaces } from "@/store/mapSlice";
import { useSelector } from "react-redux";

const MapPlaceDetail: React.FC = () => {
  const place = useSelector(selectSelectedPlaces);

  if (!place) {
    return null;
  }

  return <p>{place.name}</p>;
};

export default MapPlaceDetail;
