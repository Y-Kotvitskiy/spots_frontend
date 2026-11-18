import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import GoogleMap from "@/modules/GoogleMap";
import styles from "./ProtectedLayout.module.scss"; // Стили для позиционирования

const ProtectedLayout: React.FC = () => {
  const location = useLocation();

  // Проверяем, находимся ли мы на странице карты (корневая или /map)
  const isMapActive =
    location.pathname === "/" ||
    location.pathname === "/map" ||
    location.pathname.startsWith("/map/");

  return (
    <div className={styles.layout}>
      <div
        className={`${styles.mapContainer} ${!isMapActive ? styles.hidden : ""}`}
      >
        <GoogleMap />
      </div>

      {/* Остальные страницы рендерятся поверх или рядом */}
      <div className={styles.contentContainer}>
        <Outlet />
      </div>
    </div>
  );
};

export default ProtectedLayout;
