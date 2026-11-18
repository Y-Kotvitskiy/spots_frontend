import { mapActions } from "@/store";
import { useAppDispatch, useMapSelector } from "@/store/hooks";
import type { CategoryRecord, Filters } from "@/store/slices/mapSlice";
import { Tag, type TagKey } from "@/types";
import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";

type FilterParams = Partial<Record<"categories" | "tags", string>>;
const SPLIT_SYMBOL = "~";

function getURLFilterParams(filters: Filters, stateCategories: CategoryRecord) {
  const params: FilterParams = {};

  if (filters.categories.length > 0) {
    params.categories = filters.categories
      .map((categoryId) => stateCategories[categoryId])
      .join(SPLIT_SYMBOL);
  }

  if (filters.tags.length > 0) {
    params.tags = filters.tags.join(SPLIT_SYMBOL);
  }

  return new URLSearchParams(params);
}

function getURLFilter(
  searchParams: URLSearchParams,
  stateCategories: CategoryRecord,
) {
  const param: Filters = { categories: [], tags: [] };
  const urlCategories =
    searchParams.get("categories")?.toLowerCase().split(SPLIT_SYMBOL) || [];
  const urlTags = searchParams.get("tags")?.split(SPLIT_SYMBOL) || [];
  const stateCategoryValues = Object.values(stateCategories);

  if (urlCategories.length > 0 && stateCategoryValues.length > 0) {
    param.categories = Object.entries(stateCategories)
      .filter(([_id, value]) => urlCategories.includes(value.toLowerCase()))
      .map(([id]) => id);
  }

  if (urlTags.length > 0) {
    const tagKeys = Object.keys(Tag) as TagKey[];
    param.tags = tagKeys.filter((tag) => urlTags.includes(tag));
  }

  return param;
}

export function useFilterParams() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { filters, categories } = useMapSelector();
  const dispatch = useAppDispatch();
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (!isInitialMount.current) {
      return;
    }

    if (Object.keys(categories).length) {
      const filters = getURLFilter(searchParams, categories);

      isInitialMount.current = false;
      dispatch(mapActions.setFilters(filters));
    }
  }, [searchParams, categories, dispatch]);

  useEffect(() => {
    if (isInitialMount.current) {
      return;
    }

    setSearchParams(getURLFilterParams(filters, categories));
  }, [filters, categories]);
}
