import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./SavePlaceForm.module.scss";
import { useSelector } from "react-redux";
import { selectSelectedCoords } from "@/store/mapSlice";
import cn from "classnames";

interface Position {
  lat: number;
  lng: number;
}

interface ModalFormData {
  Name: string;
  Categories: string;
  Tags: string;
  address: string;
  description: string;
  location: string;
  photos: string;
}

interface ModalFormProps {
  isOpen: boolean;
  onClose: () => void;
  //  onSubmit: (data: ModalFormData) => void;
  initialData?: Partial<ModalFormData>;
}

type FormPages = 1 | 2 | 3;

const SavePlaceForm: React.FC<ModalFormProps> = ({ isOpen, onClose }) => {
  const [activePage, setActivePage] = useState<FormPages>(1);

  const selectedCoords = useSelector(selectSelectedCoords);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // onSubmit({
    //   name,
    //   address,
    //   position: { lat, lng },
    // });

    onClose();
  };

  const handleNextClick = () => {
    if (activePage >= 3) {
      setActivePage(1);
    } else {
      setActivePage((prev) => (prev + 1) as FormPages);
    }
  };

  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <header className={styles.SavePlaceForm__header}>
            <h1>Add place {activePage}/3</h1>
            <button className={styles.SavePlaceForm__headerClose}></button>
          </header>
          <main></main>
          <fieldset
            className={cn(styles.SavePlaceForm__header__fieldset, {
              [styles.SavePlaceForm__header__fieldset_active]: activePage === 1,
            })}
          >
            Name, Categories, Tags
          </fieldset>
          <fieldset
            className={cn(styles.SavePlaceForm__header__fieldset, {
              [styles.SavePlaceForm__header__fieldset_active]: activePage === 2,
            })}
          >
            address, description, location
          </fieldset>
          <fieldset
            className={cn(styles.SavePlaceForm__header__fieldset, {
              [styles.SavePlaceForm__header__fieldset_active]: activePage === 3,
            })}
          >
            photos
          </fieldset>
          <footer>
            <button type="button" onClick={handleNextClick}>
              Next
            </button>
          </footer>
        </form>
      </div>
    </div>,
    document.body,
  );
};

export default SavePlaceForm;
