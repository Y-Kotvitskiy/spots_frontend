import styles from "./MapFilter.module.scss";
import { useAppDispatch, useMapSelector } from "@/store/hooks";
import cn from "classnames";
import { MapMode } from "@/store/slices/mapSlice";
import { useEffect, useRef, type RefObject } from "react";
import { mapActions } from "@/store";
import { Tag, type CategoryKey, type TagKey } from "@/types";
import PlaceField from "../../PlaceField";
import type React from "react";

interface Props {
  className: string;
  filterButton: RefObject<HTMLButtonElement | null>;
}

export interface FormValues {
  categories: CategoryKey[];
  tags: TagKey[];
}

const MapFilter: React.FC<Props> = ({ className, filterButton }) => {
  const { filters } = useMapSelector();
  const { mapMode } = useMapSelector();
  const filterClasses = cn(className, styles.MapFilter);
  const filterRef = useRef<HTMLFormElement>(null);
  const dispatch = useAppDispatch();
  const { categories } = useMapSelector();

  useEffect(() => {
    if (mapMode !== MapMode.Filter) {
      return;
    }

    function handleClickOutside(event: MouseEvent) {
      if (mapMode !== MapMode.Filter || !filterButton.current) {
        return;
      }

      const target = event.target as Node;

      if (
        !filterButton.current.contains(target) &&
        filterRef.current &&
        !filterRef.current.contains(event.target as Node)
      ) {
        dispatch(mapActions.setMapMode(MapMode.Show));
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [mapMode === MapMode.Filter, dispatch]);

  if (mapMode !== MapMode.Filter) {
    return null;
  }

  const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  const handleCategoryClick = (
    currentCategory: React.ChangeEvent<any> | string,
  ) => {
    if (typeof currentCategory !== "string") {
      return;
    }

    dispatch(mapActions.toggleFilterCategory(currentCategory));
  };

  const handleTagClick = (currentTag: React.ChangeEvent<any> | string) => {
    if (
      typeof currentTag !== "string" ||
      !Object.keys(Tag).includes(currentTag)
    ) {
      return;
    }

    dispatch(mapActions.toggleFilterTag(currentTag));
  };

  return (
    <form
      className={filterClasses}
      ref={filterRef}
      action="#"
      onSubmit={handleSubmit}
    >
      <header className={styles.MapFilter__header}>
        <button
          className={styles.MapFilter__headerClear}
          type="reset"
          onClick={() => dispatch(mapActions.clearFilter())}
        >
          Clear
        </button>
        <h3 className={styles.MapFilter__headerTitle}>Filters</h3>
        <button
          className={styles.MapFilter__headerClose}
          type="button"
          onClick={() => dispatch(mapActions.setMapMode(MapMode.Show))}
          aria-label="Close filter"
        ></button>
      </header>

      <main className={styles.MapFilter__main}>
        {/* Шаг 1 */}
        <fieldset className={styles.MapFilter__fieldset}>
          <PlaceField
            label="Category"
            name="category"
            type="selectButtons"
            value={filters.categories}
            options={categories}
            onChange={handleCategoryClick}
            onBlur={() => {}}
          />
          <PlaceField
            label="Tags"
            name="tags"
            type="selectButtons"
            value={filters.tags}
            options={Tag}
            onChange={handleTagClick}
            onBlur={() => {}}
          />
        </fieldset>
      </main>
    </form>
  );
};

export default MapFilter;
