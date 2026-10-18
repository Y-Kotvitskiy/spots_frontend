import styles from "./Map.module.scss";
import AddPlace from "./AddPlace";
import MyPlaces from "./MyPlaces/MyPlaces";
import GoogleMap from "./GoogleMap";

const Map = () => {
  return (
    <main className={styles.Map}>
      <h1>Map Component</h1>
      <GoogleMap />
      <AddPlace />
      <MyPlaces />
    </main>
  );
};

export default Map;
