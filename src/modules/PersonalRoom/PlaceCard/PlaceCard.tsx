import React, { useState, useRef, useEffect } from "react";
import styles from "./PlaceCard.module.scss";
import Icon from "@/modules/shared/Icon";

interface PlaceCardProps {
  image: string;
  title: string;
  category: string;
  workingHours?: string;
  isShared?: boolean | string; // Може бути числом груп або boolean
  onEdit?: () => void;
  onShare?: () => void;
  onDelete?: () => void;
  onClick?: () => void;
}

const PlaceCard: React.FC<PlaceCardProps> = ({
  image,
  title,
  category,
  workingHours = "08:00 - 20:00",
  isShared = false,
  onEdit,
  onShare,
  onDelete,
  onClick,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Закриття меню при кліку поза ним
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <div className={styles.placeCard} onClick={onClick}>
      {/* Верхня частина з фото та кнопкою опцій */}
      <div className={styles.placeCard__imageWrapper}>
        <img src={image} alt={title} className={styles.placeCard__image} />
        
        <div className={styles.placeCard__menuContainer} ref={menuRef}>
          <button 
            type="button" 
            className={styles.placeCard__menuBtn} 
            onClick={(e) => {
              e.stopPropagation();
              setIsMenuOpen((prev) => !prev);
            }}
            aria-label="More options"
          >
            <Icon name="menu" size={20} />
          </button>

          {/* Випадаюче меню як на макеті */}
          {isMenuOpen && (
            <div className={styles.placeCard__dropdown}>
              <button 
                type="button" 
                className={styles.placeCard__dropdownItem}
                onClick={(e) => { e.stopPropagation(); setIsMenuOpen(false); onEdit?.(); }}
              >
                Edit place
              </button>
              <button 
                type="button" 
                className={styles.placeCard__dropdownItem}
                onClick={(e) => { e.stopPropagation(); setIsMenuOpen(false); onShare?.(); }}
              >
                Share with group
              </button>
              <button 
                type="button" 
                className={styles.placeCard__dropdownItemDanger}
                onClick={(e) => { e.stopPropagation(); setIsMenuOpen(false); onDelete?.(); }}
              >
                Delete place
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Контентна частина картки */}
      <div className={styles.placeCard__content}>
        <h3 className={styles.placeCard__title}>{title}</h3>
        
        <div className={styles.placeCard__info}>
          <span className={styles.placeCard__category}>{category}</span>
          <span className={styles.placeCard__separator}>•</span>
          <span className={styles.placeCard__hours}>{workingHours}</span>
        </div>

        <div className={styles.placeCard__statusWrapper}>
          <span className={isShared ? styles.placeCard__shared : styles.placeCard__notShared}>
            {typeof isShared === "string" ? isShared : isShared ? "Shared in groups" : "Not shared"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PlaceCard;