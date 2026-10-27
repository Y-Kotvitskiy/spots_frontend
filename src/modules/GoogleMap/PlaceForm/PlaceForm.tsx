import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useSelector } from "react-redux";
import cn from "classnames";
import { useFormik, type FormikHelpers } from "formik";

import { MapMode, selectMapMode, selectSelectedCoords } from "@/store/mapSlice";
import { mapActions } from "@/store";
import { useAppDispatch } from "@/store/hooks";
import { useAuth } from "@/components/AuthContext";
import Button from "@/modules/shared/Button/";

import PlaceField from "./PlaceField/PlaceField";
import PlacePhotoField from "./PlacePhotoField";
import styles from "./PlaceForm.module.scss";

import { INITIAL_VALUES } from "./PlaceForm.types";

import type { FormValues, FormPages } from "./PlaceForm.types";

import { validatePlaceForm } from "./PlaceForm.utils";
import { Category, Tag, type CategoryKey, type TagKey } from "@/types";
import { getAddressFromCoords } from "../utils";

const PlaceForm: React.FC = () => {
  const [activePage, setActivePage] = useState<FormPages>(1);
  const dispatch = useAppDispatch();
  const { currentUser } = useAuth();
  const selectedCoords = useSelector(selectSelectedCoords);

  const formik = useFormik<FormValues>({
    initialValues: INITIAL_VALUES,
    enableReinitialize: true,
    validate: validatePlaceForm,
    onSubmit: async (values, helpers: FormikHelpers<FormValues>) => {
      if (!selectedCoords || !currentUser) return;

      dispatch(
        mapActions.addPlace({
          id: Date.now(),
          creator_id: currentUser.id,
          name: values.name,
          description: values.description,
          category: values.category as CategoryKey,
          tags: values.tags,
          address: selectedCoords.address || "",
          latitude: selectedCoords.lat || 0,
          longitude: selectedCoords.lng || 0,
          created_at: new Date().toISOString(),
        }),
      );

      helpers.setSubmitting(false);
      setActivePage(3);
    },
  });

  const isOpen = useSelector(selectMapMode) === MapMode.Add;

  const onClose = () => {
    dispatch(mapActions.setMapMode(MapMode.Show));
    dispatch(mapActions.clearSelectedCoord());
  };

  // Эффект для закрытия по Esc, блокировки скролла и сброса формы
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    formik.resetForm({ values: INITIAL_VALUES });
    setActivePage(1);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const getAddress = async () => {
      if (selectedCoords) {
        const { lat, lng } = selectedCoords;
        const address = await getAddressFromCoords(lat, lng);
        dispatch(mapActions.setSelectedCoords({ lat, lng, address }));
      }
    };

    if (!selectedCoords?.address && activePage === 2) {
      getAddress();
    }
  }, [activePage]);

  if (!isOpen) return null;

  // Обработчики для категорий и тегов
  const handleCategoryClick = (
    newCategory: React.ChangeEvent<any> | string,
  ) => {
    if (
      typeof newCategory !== "string" ||
      !Object.keys(Category).includes(newCategory)
    ) {
      return;
    }

    formik.setFieldValue("category", newCategory);
  };

  const handleTagClick = (currentTag: React.ChangeEvent<any> | string) => {
    if (
      typeof currentTag !== "string" ||
      !Object.keys(Tag).includes(currentTag)
    ) {
      return;
    }

    const currentTags = formik.values.tags;
    const isSelected = currentTags.includes(currentTag as TagKey);
    const updatedTags = isSelected
      ? currentTags.filter((tag) => tag !== currentTag)
      : [...currentTags, currentTag];

    formik.setFieldValue("tags", updatedTags);
  };

  // Валидация перехода на следующий шаг
  const isDisabledNext = () => {
    if (activePage === 1) return !formik.values.name || !formik.values.category;
    if (activePage === 2) return !formik.values.description.trim();
    return false;
  };

  const handleNextClick = () => {
    if (activePage === 2) {
      formik.submitForm();
    } else if (activePage === 3) {
      onClose();
    } else {
      setActivePage((prev) => (prev + 1) as FormPages);
    }
  };

  const handlePrevPageButton = () => {
    if (activePage > 1) setActivePage((prev) => (prev - 1) as FormPages);
  };

  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <form onSubmit={(e) => e.preventDefault()}>
          <header className={styles.PlaceForm__header}>
            <h1>
              {activePage === 3
                ? "Your place is now on the map"
                : `Add place ${activePage}/3`}
            </h1>

            {activePage === 2 && (
              <button
                className={styles.PlaceForm__headerPrevPageButton}
                type="button"
                onClick={handlePrevPageButton}
                aria-label="Previous page"
              />
            )}
            <button
              className={styles.PlaceForm__headerClose}
              type="button"
              onClick={onClose}
              aria-label="Close modal"
            />
          </header>

          <main>
            {/* Шаг 1 */}
            <fieldset
              className={cn(styles.PlaceForm__fieldset, {
                [styles.PlaceForm__fieldset_active]: activePage === 1,
              })}
            >
              <PlaceField
                label="Name"
                name="name"
                type="text"
                placeholder="Place name"
                required
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.errors.name}
                touched={formik.touched.name}
              />
              <PlaceField
                label="Category"
                name="category"
                type="selectButtons"
                required
                value={formik.values.category || ""}
                options={Category}
                onChange={handleCategoryClick}
                onBlur={formik.handleBlur}
              />
              <PlaceField
                label="Tags"
                name="tags"
                type="selectButtons"
                value={formik.values.tags}
                options={Tag}
                onChange={handleTagClick}
                onBlur={formik.handleBlur}
              />
            </fieldset>

            {/* Шаг 2 */}
            <fieldset
              className={cn(styles.PlaceForm__fieldset, {
                [styles.PlaceForm__fieldset_active]: activePage === 2,
              })}
            >
              <PlaceField
                label="Description"
                name="description"
                type="textarea"
                required
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.errors.description}
                touched={formik.touched.description}
              />
              <PlaceField
                label="Location"
                name="address"
                type="text"
                required
                value={selectedCoords?.address || "loading.."}
                onChange={() => {}}
                onBlur={formik.handleBlur}
                touched={false}
              />
              <PlacePhotoField
                label="Photo"
                name="photo"
                onChange={(file) => formik.setFieldValue("photo", file)}
              />
            </fieldset>

            {/* Шаг 3 (Успех) */}
            <div
              className={cn(styles.PlaceForm__fieldset, {
                [styles.PlaceForm__fieldset_active]: activePage === 3,
              })}
            >
              <span className={styles.PlaceForm__finalMessage}>
                Other people can find it and add it to their lists.
              </span>
            </div>
          </main>

          <footer className={styles.PlaceForm__footer}>
            <Button
              type="button"
              disabled={isDisabledNext()}
              onClick={handleNextClick}
              text={activePage < 3 ? "Next" : "Great"}
            />
          </footer>
        </form>
      </div>
    </div>,
    document.body,
  );
};

export default PlaceForm;
