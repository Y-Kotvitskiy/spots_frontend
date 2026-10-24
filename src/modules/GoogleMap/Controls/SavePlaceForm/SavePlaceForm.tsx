import type { SelectedPoint } from "../../GoogleMap";

interface Props {
  selectedCoords: SelectedPoint | null;
}

const SavePlaceForm: React.FC<Props> = ({ selectedCoords }) => {
  return (
    <div>
      selectedPoint: {selectedCoords && JSON.stringify(selectedCoords)}
      <button>Close</button>
      <button>Save</button>
    </div>
  );
};

export default SavePlaceForm;
