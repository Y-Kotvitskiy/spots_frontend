import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import GoogleMap from "@/modules/GoogleMap";
import styles from "./ProtectedLayout.module.scss"; // Стили для позиционирования

const ProtectedLayout: React.FC = () => {
  const location = useLocation();

  // Проверяем, находимся ли мы на странице карты (корневая или /map)
  const isMapActive = location.pathname === "/" || location.pathname === "/map";

  return (
    <div className={styles.layout}>
      {/* Карточку рендерим ВСЕГДА на уровне лэкаута. 
          Если мы не на странице карты, можно просто скрыть её через CSS (display: none),
          чтобы она не пересоздавалась и сохраняла свое состояние/зум. */}
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
