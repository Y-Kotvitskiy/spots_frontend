import React, { useState, useEffect, useRef } from "react";
import styles from "./EditPlace.module.scss";
import Icon from "@/modules/shared/Icon";
import FormButton from "@/modules/AuthContainer/FormButton";
import { Tag, type Place, type TagKey } from "@/types";
import { useMapSelector } from "@/store/hooks";
import { placeService } from "@/services/placeService";
import cn from "classnames";
import WorkingHoursPicker from "./WorkingHoursPicker";
import { createPortal } from "react-dom";

interface EditPlaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  place: Place;
  onUpdate?: (updatedPlace: Place) => void;
}

const EditPlaceModal: React.FC<EditPlaceModalProps> = ({
  isOpen,
  onClose,
  place,
  onUpdate,
}) => {
  const [activePage, setActivePage] = useState<1 | 2 | 3>(1);
  const [isLoading, setIsLoading] = useState(false);
  const { categories } = useMapSelector();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Локальний стейт для всіх полів (зберігається в пам'яті до натискання "Save changes")
  const [name, setName] = useState(place?.name || "");
  const [selectedCategory, setSelectedCategory] = useState<string>(
    place?.categoryId || ""
  );
  const [selectedTags, setSelectedTags] = useState<TagKey[]>(place?.tags || []);
  const [description, setDescription] = useState(place?.description || "");
  const [address, setAddress] = useState(place?.address || "");
  const [photos, setPhotos] = useState<any[]>([]);
  const [workingHours, setWorkingHours] = useState(
    place?.opening_hours
      ? `${place.opening_hours.opens_at}-${place.opening_hours.closes_at}`
      : "08:00-20:00"
  );
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  // Синхронізація даних при відкритті або зміні місця
  useEffect(() => {
    if (place) {
      setName(place.name || "");
      setSelectedCategory(place.categoryId || "");
      setSelectedTags(place.tags || []);
      setDescription(place.description || "");
      setAddress(place.address || "");
      setPhotos(place?.photos ? Object.values(place.photos) : []);
      setWorkingHours(
        place.opening_hours
          ? `${place.opening_hours.opens_at}-${place.opening_hours.closes_at}`
          : "08:00-20:00"
      );
    }
    if (isOpen) {
      setActivePage(1);
    }
  }, [place, isOpen]);

  if (!isOpen) return null;

  const handleCategoryClick = (catKey: string) => {
    setSelectedCategory(catKey);
  };

  const handleTagClick = (tagKey: string) => {
    const isSelected = selectedTags.includes(tagKey as TagKey);
    const updatedTags = isSelected
      ? selectedTags.filter((t) => t !== tagKey)
      : [...selectedTags, tagKey as TagKey];
    setSelectedTags(updatedTags);
  };

  // Додавання фото відразу на сервер (локально вирішив не зберігати)
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && place?.id) {
      try {
        const newPhoto = await placeService.addPhoto(place.id, file);
        const updatedPhotos = [...photos, newPhoto];
        setPhotos(updatedPhotos);
        if (onUpdate) {
          onUpdate({ ...place, photos: updatedPhotos });
        }
      } catch (err) {
        console.error("Failed to add photo:", err);
      }
    }
  };

  // Видалення фото за ID
  const handleDeletePhoto = async (photoId: string) => {
    if (!place?.id) return;
    try {
      await placeService.deletePhoto(place.id, photoId);
      const updatedPhotos = photos.filter((p) => p.id !== photoId);
      setPhotos(updatedPhotos);
      if (onUpdate) {
        onUpdate({ ...place, photos: updatedPhotos });
      }
    } catch (err) {
      console.error("Failed to delete photo:", err);
    }
  };

  const handleNextOrSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (activePage < 3) {
      setActivePage((prev) => (prev + 1) as 1 | 2 | 3);
      return;
    }

    try {
      setIsLoading(true);

      const [opens_at, closes_at] = workingHours.split("-");
      const updateData = {
        name,
        description,
        address,
        category_ids: selectedCategory ? [selectedCategory] : [],
        tags: selectedTags,
        opening_hours: {
          opens_at: opens_at?.trim() || "08:00",
          closes_at: closes_at?.trim() || "20:00",
        },
      };

      const updatedPlace = await placeService.update(place.id, updateData);

      if (onUpdate) {
        const mappedPlace: Place = {
          ...place,
          ...updatedPlace,
          categoryId: selectedCategory,
          categoryName: categories[selectedCategory] || place.categoryName,
          tags: selectedTags,
          description,
          address,
          opening_hours: updateData.opening_hours,
        };
        onUpdate(mappedPlace);
      }
      onClose();
    } catch (error) {
      console.error("Failed to update place:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modal__header}>
          {activePage > 1 ? (
            <button
              className={styles.modal__backBtn}
              onClick={() => setActivePage((prev) => (prev - 1) as 1 | 2)}
              type="button"
              aria-label="Previous page"
            >
              <Icon name="back" />
            </button>
          ) : (
            <div style={{ width: 28 }} />
          )}

          <h3 className={styles.modal__title}>Edit place {activePage}/3</h3>

          <button className={styles.modal__closeBtn} onClick={onClose} type="button" aria-label="Close modal">
            <Icon name="close"/>
          </button>
        </div>

        <form onSubmit={handleNextOrSubmit} className={styles.modal__form}>
          {activePage === 1 && (
            <>
              {/* КРОК 1: Назва, Категорія, Теги */}
              <div className={styles.modal__field}>
                <label className={styles.modal__label}>
                  Place name <span className={styles.modal__required}>*</span>
                </label>
                <div className={styles.modal__inputWrapper}>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={styles.modal__input}
                    placeholder="Place name"
                    required
                  />
                </div>
              </div>

              <div className={styles.modal__setField}>
                <label className={styles.modal__label}>Category</label>
                <div className={styles.modal__chipsGrid}>
                  {Object.entries(categories).map(([key, label]) => {
                    const isSelected = selectedCategory === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        className={cn(styles.modal__chip, {
                          [styles.modal__chipActive]: isSelected,
                        })}
                        onClick={() => handleCategoryClick(key)}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className={styles.modal__setField}>
                <label className={styles.modal__label}>Tags</label>
                <div className={styles.modal__chipsGrid}>
                  {Object.entries(Tag).map(([key, label]) => {
                    const isSelected = selectedTags.includes(key as TagKey);
                    return (
                      <button
                        key={key}
                        type="button"
                        className={cn(styles.modal__chip, {
                          [styles.modal__chipActive]: isSelected,
                        })}
                        onClick={() => handleTagClick(key)}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {activePage === 2 && (
            <>
              {/* КРОК 2: Опис, Локація, Фото */}
              <div className={styles.modal__setField}>
                <label className={styles.modal__label}>
                  Description <span className={styles.modal__required}>*</span>
                </label>
                <div className={styles.modal__textareaWrapper}>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className={styles.modal__textarea}
                    placeholder="Place description..."
                    rows={4}
                    required
                  />
                </div>
              </div>

              <div className={styles.modal__setField}>
                <label className={styles.modal__label}>
                  Location <span className={styles.modal__required}>*</span>
                </label>
                <div className={styles.modal__inputWrapper}>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className={styles.modal__input}
                    placeholder="12 Main Street, Kyiv, 04210"
                    required
                  />
                </div>
              </div>

              <div className={styles.modal__setField}>
                <label className={styles.modal__label}>Photos</label>
                <div className={styles.modal__photosGrid}>
                  {photos.map((photo) => (
                    <div key={photo.id} className={styles.modal__photoCard}>
                      <img src={photo.url} alt="Place photo" />
                      <button
                        type="button"
                        className={styles.modal__deletePhotoBtn}
                        onClick={() => handleDeletePhoto(photo.id)}
                        aria-label="Delete photo"
                      >
                        <Icon name="close" />
                      </button>
                    </div>
                  ))}

                  {photos.length < 5 && (
                    <button
                      type="button"
                      className={styles.modal__addPhotoCard}
                      onClick={() => fileInputRef.current?.click()}
                      aria-label="Add photo"
                    >
                      <Icon name="plus" size={28} />
                    </button>
                  )}
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  style={{ display: "none" }}
                />
              </div>
            </>
          )}

          {activePage === 3 && (
            <>
              {/* КРОК 3: Робочі години */}
              <div className={styles.modal__setField}>
                <label className={styles.markLabel || styles.modal__label}>
                  Working hours <span className={styles.modal__required}>*</span>
                </label>
                <div 
                  className={styles.modal__inputWrapper} 
                  onClick={() => setIsPickerOpen(true)}
                  style={{ cursor: "pointer" }}
                >
                  <input
                    type="text"
                    value={workingHours}
                    readOnly
                    className={styles.modal__input}
                    placeholder="08:00-20:00"
                    required
                  />
                  <span className={styles.modal__inputIcon}>
                    <Icon name="down" size={16} />
                  </span>
                </div>
              </div>

              <WorkingHoursPicker
                isOpen={isPickerOpen}
                onClose={() => setIsPickerOpen(false)}
                initialValue={workingHours}
                onSelect={(val) => setWorkingHours(val)}
              />
            </>
          )}

          <FormButton
            type="submit"
            text={
              isLoading
                ? "Saving..."
                : activePage === 3
                ? "Save changes"
                : "Next"
            }
          />
        </form>
      </div>
    </div>,
  document.body
  );
};

export default EditPlaceModal;