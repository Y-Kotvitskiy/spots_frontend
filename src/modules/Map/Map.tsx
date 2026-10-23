import styles from "./Map.module.scss";
import MyPlaces from "./MyPlaces/MyPlaces";

const Map = () => {
  return (
    <main className={styles.Map}>
      <h1>Map Component</h1>
      <MyPlaces />
    </main>
  );
};

export default Map;
