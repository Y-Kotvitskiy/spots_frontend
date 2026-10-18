import styles from "./MyPlaces.module.scss";

import { usePageError } from "@/modules/hooks";
import { placeService } from "@/services/placeService";
import type { Place } from "@/types";
import type { AxiosError } from "axios";
import { useState } from "react";

type PlacesErrors = AxiosError<{
  message: string;
}>;

const MyPlaces = () => {
  const [places, setPlaces] = useState<Place[] | null>(null);
  const [error, setError] = usePageError("");

  const handleUpdatePlaces = async () => {
    try {
      const updatedPlaces = await placeService.getAll();
      setPlaces(updatedPlaces);
    } catch (err) {
      const error = err as PlacesErrors;
      if (!error.response?.data) return;

      const { message } = error.response.data;

      setError(message ?? "Error");
    }
  };

  return (
    <section>
      <div>
        {places && places.length > 0
          ? places.map((place) => (
              <pre key={place.id}>{JSON.stringify(place)}</pre>
            ))
          : "No places"}
      </div>
      <button onClick={handleUpdatePlaces}>update</button>
      {error && <p className={styles.MyPlaces__error}>{error}</p>}
    </section>
  );
};

export default MyPlaces;
