import styles from "./PersonalRoom.module.scss";

import type { AxiosError } from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAuthSelector, useMapSelector } from "@/store/hooks";
import { usePlaceCardActions } from "../usePlaceCardActions";
import { authActions, mapActions } from "@/store";
import { usePageError } from "../hooks.ts";

import PlaceCard from "../shared/PlaceCard";
import { Tag, type Place } from "@/types";
import ConfirmForm from "../shared/ConfirmForm/ConfirmForm.tsx";
import Icon from "../shared/Icon";
import Loader from "@/modules/shared/Loader";
import EditProfile from "./EditProfileModal/EditProfileModal.tsx";
import EditPlaceModal from "../shared/PlaceCard/EditPlace/index.ts";
import { userService } from "@/services/userService.ts";
import { PAGE_SIZE_OPTIONS } from "../constants.ts";
import type { DropdownOption } from "../shared/FilterDropdown/FilterDropdown.tsx";
import FilterDropdown from "../shared/FilterDropdown/FilterDropdown.tsx";
import Pagination from "../shared/Pagination/Pagination.tsx";

type PageSizeOption = (typeof PAGE_SIZE_OPTIONS)[number];
const MIN_PAGE_SIZE = PAGE_SIZE_OPTIONS[0];

const parsePageParam = (value: string | null): number => {
  if (!value) return 1;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
};

const parsePageSizeParam = (value: string | null): PageSizeOption => {
  if (!value) return MIN_PAGE_SIZE;
  const parsed = Number.parseInt(value, 10);
  return PAGE_SIZE_OPTIONS.includes(parsed as PageSizeOption)
    ? (parsed as PageSizeOption)
    : MIN_PAGE_SIZE;
};

const PersonalRoom = () => {
  // ==========================================
  // HOOKS & SELECTORS
  // ==========================================

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { currentUser } = useAuthSelector();
  const [error, setError] = usePageError("");
  const [searchParams, setSearchParams] = useSearchParams();
  const { savedPlaces } = useMapSelector();

  // ==========================================
  // URL PARAMS & STATES
  // ==========================================

  const rawTab = searchParams.get("tab");
  const activeTab = rawTab === "shared-to-me" ? "shared-to-me" : "my-places";

  const urlSearchQuery = searchParams.get("q") || "";
  const [draftSearch, setDraftSearch] = useState<string | null>(null);
  const searchInputValue = draftSearch ?? urlSearchQuery;

  const searchType =
    (searchParams.get("searchType") as "name" | "user") || "name";
  const selectedCategory = searchParams.get("category") || "all";

  const currentPage = parsePageParam(searchParams.get("page"));
  const pageSize = parsePageSizeParam(searchParams.get("perPage"));

  const tagsParam = searchParams.get("tags");
  const selectedTags = tagsParam ? tagsParam.split(",").filter(Boolean) : [];

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [loadedAvatar, setLoadedAvatar] = useState<string>();
  const [placeToEdit, setPlaceToEdit] = useState<Place | null>(null);

  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);

  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const tagDropdownRef = useRef<HTMLDivElement>(null);

  const isAvatarLoaded =
    !!currentUser?.avatar && loadedAvatar === currentUser.avatar;
  const currentUserId = currentUser?.id;

  // ==========================================
  // QUERY PARAMS & DEBOUNCED SEARCH
  // ==========================================

  const updateQueryParams = (
    updates: Record<string, string | null>,
    options?: { resetPage?: boolean }
  ) => {
    const shouldResetPage = options?.resetPage ?? true;
    const newParams = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "" || value === "all") {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    });

    if (shouldResetPage) {
      newParams.delete("page");
    }

    setSearchParams(newParams, { replace: true });
  };

  useEffect(() => {
    if (draftSearch === null) return;

    const timerId = setTimeout(() => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (draftSearch.trim() === "") next.delete("q");
          else next.set("q", draftSearch);
          next.delete("page");
          return next;
        },
        { replace: true }
      );
      setDraftSearch(null);
    }, 300);

    return () => clearTimeout(timerId);
  }, [draftSearch, setSearchParams]);

  // ==========================================
  // DROPDOWN OUTSIDE CLICK & DATA EFFECTS
  // ==========================================

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target as Node)
      ) {
        setIsCategoryDropdownOpen(false);
      }
      if (
        tagDropdownRef.current &&
        !tagDropdownRef.current.contains(event.target as Node)
      ) {
        setIsTagDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    let ignore = false;
    userService
      .getMe()
      .then((u) => {
        if (!ignore) dispatch(authActions.updateUser(u));
      })
      .catch((err) => console.error("Failed to fetch user profile:", err));
    return () => {
      ignore = true;
    };
  }, [dispatch]);

  useEffect(() => {
    if (!error) return;
    const timerId = setTimeout(() => {
      navigate("/");
    }, 3000);
    return () => clearTimeout(timerId);
  }, [navigate, error]);

  // ==========================================
  // CARD ACTIONS
  // ==========================================

  const {
    placeToDelete,
    handleOpenShare,
    handleDeletePersonal,
    handleConfirmDeletePersonal,
    handleCancelDelete,
  } = usePlaceCardActions();

  // ==========================================
  // FILTERING & PAGINATION DERIVED DATA
  // ==========================================

  const myPlaces = currentUserId
    ? savedPlaces.filter((p) => p.creator_id === currentUserId)
    : [];

  const availableCategories = Array.from(
    new Set(
      savedPlaces
        .map((p) => p.categoryName)
        .filter((category): category is string => Boolean(category))
    )
  );

  const filteredMyPlaces = myPlaces.filter((place) => {
    if (urlSearchQuery.trim() !== "") {
      const query = urlSearchQuery.toLowerCase();
      if (!place.name?.toLowerCase().includes(query)) return false;
    }
    return true;
  });

  const filteredSharedPlaces = savedPlaces.filter((place) => {
    if (currentUserId && place.creator_id === currentUserId) {
      return false;
    }

    if (urlSearchQuery.trim() !== "") {
      const query = urlSearchQuery.toLowerCase();
      if (searchType === "name") {
        if (!place.name?.toLowerCase().includes(query)) return false;
      } else if (searchType === "user") {
        if (!place.creator_name?.toLowerCase().includes(query)) return false;
      }
    }

    if (selectedCategory !== "all" && place.categoryName !== selectedCategory) {
      return false;
    }

    if (selectedTags.length > 0) {
      if (
        !place.tags ||
        !selectedTags.every((tag) =>
          place.tags?.includes(tag as keyof typeof Tag)
        )
      ) {
        return false;
      }
    }

    return true;
  });

  const activeFilteredPlaces =
    activeTab === "my-places" ? filteredMyPlaces : filteredSharedPlaces;

  const totalItems = activeFilteredPlaces.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const shouldShowPagination = totalItems > MIN_PAGE_SIZE;

  const startIndex = (safeCurrentPage - 1) * pageSize;
  const paginatedPlaces = activeFilteredPlaces.slice(
    startIndex,
    startIndex + pageSize
  );

  // ==========================================
  // EVENT HANDLERS
  // ==========================================

  const handlePlaceUpdated = (updatedPlace: Place) => {
    dispatch(mapActions.updatePlace(updatedPlace));
  };

  const placesCount = myPlaces.length;

  const handleLogout = async () => {
    try {
      await dispatch(authActions.logout()).unwrap();
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message ?? "");
    }
  };

  const handleSaveProfile = async (newName: string, avatarFile?: File) => {
    try {
      const updatedUser = await userService.updateMe({
        display_name: newName,
        file: avatarFile,
      });
      dispatch(authActions.updateUser(updatedUser));
      setIsEditModalOpen(false);
    } catch (saveError: unknown) {
      console.error("Failed to update profile:", saveError);
      throw saveError;
    }
  };

  const handleClearAll = () => {
    setDraftSearch(null);
    updateQueryParams(
      {
        q: null,
        searchType: null,
        category: null,
        tags: null,
      },
      { resetPage: true }
    );
  };

  const handleTagToggle = (tagKey: string) => {
    const updatedTags = selectedTags.includes(tagKey)
      ? selectedTags.filter((t) => t !== tagKey)
      : [...selectedTags, tagKey];

    updateQueryParams({
      tags: updatedTags.length > 0 ? updatedTags.join(",") : null,
    });
  };

  const handlePageChange = (page: number) => {
    const clampedPage = Math.max(1, Math.min(page, totalPages));
    updateQueryParams(
      {
        page: clampedPage === 1 ? null : String(clampedPage),
      },
      { resetPage: false }
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePageSizeChange = (newSize: number) => {
    const validSize = parsePageSizeParam(String(newSize));
    updateQueryParams(
      {
        perPage: validSize === MIN_PAGE_SIZE ? null : String(validSize),
      },
      { resetPage: true }
    );
  };

  const categoryOptions: DropdownOption[] = [
    { value: "all", label: "All Categories", active: selectedCategory === "all" },
    ...availableCategories.map((category) => ({
      value: category,
      label: category,
      active: selectedCategory === category,
    })),
  ];

  const tagOptions: DropdownOption[] = [
    { value: "", label: "All Tags", active: selectedTags.length === 0 },
    ...Object.keys(Tag).map((tagKey) => {
      const isSelected = selectedTags.includes(tagKey);
      return {
        value: tagKey,
        label: Tag[tagKey as keyof typeof Tag] || tagKey,
        active: isSelected,
        checked: isSelected,
      };
    }),
  ];

  const selectedCategoryLabel =
    selectedCategory === "all" ? "All Categories" : selectedCategory;

  const selectedTagLabel =
    selectedTags.length === 0
      ? "All Tags"
      : selectedTags.length === 1
      ? Tag[selectedTags[0] as keyof typeof Tag] || selectedTags[0]
      : `${selectedTags.length} tags selected`;

  const hasActiveFilters =
    urlSearchQuery.trim() !== "" ||
    selectedCategory !== "all" ||
    selectedTags.length > 0 ||
    searchType !== "name";

  const isEmptyList = activeFilteredPlaces.length === 0;

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <main className={styles.PersonalRoom}>
      <div className={styles.container}>
        {/* User Info Section */}
        <div className={styles.personalInfo}>
          <div className={styles.personalInfo__top}>
            <div className={styles.personalInfo__avatarWrapper}>
              {(!currentUser?.avatar || !isAvatarLoaded) && (
                <div className={styles.personalInfo__patternPlaceholder}>
                  {!currentUser?.avatar && (
                    <Icon
                      name="group"
                      size={28}
                      className={styles.personalInfo__avatarIcon}
                    />
                  )}
                  {currentUser?.avatar && (
                    <Loader className={styles.personalInfo__avatarLoader} />
                  )}
                </div>
              )}

              {currentUser?.avatar && (
                <img
                  src={currentUser.avatar}
                  alt="User avatar"
                  className={`${styles.personalInfo__avatar} ${
                    isAvatarLoaded
                      ? styles.personalInfo__avatarLoaded
                      : styles.personalInfo__avatarHidden
                  }`}
                  onLoad={() => setLoadedAvatar(currentUser.avatar)}
                />
              )}
            </div>
            <div className={styles.personalInfo__content}>
              <div className={styles.personalInfo__nameRow}>
                <h2 className={styles.personalInfo__name}>
                  {currentUser?.name || "Error: Name does not exist"}
                </h2>
                <button
                  className={styles.personalInfo__EditBtn}
                  onClick={() => setIsEditModalOpen(true)}
                >
                  Edit name
                </button>
              </div>
              <div className={styles.personalInfo__stats}>
                <span>
                  {placesCount} {placesCount === 1 ? "place" : "places"}
                </span>
              </div>
            </div>
          </div>

          <div className={styles.personalInfo__buttons}>
            <button
              className={styles.personalInfo__buttons__edit}
              onClick={() => setIsEditModalOpen(true)}
            >
              <Icon name="edit" size={20} />
              <span>Edit</span>
            </button>
            <button
              className={styles.personalInfo__buttons__logout}
              onClick={handleLogout}
            >
              <Icon name="exit" size={20} />
              <span>Log out</span>
            </button>
          </div>
        </div>

        {/* Controls Header: Tabs + Search Bar on the same level */}
        <aside className={styles.controlsHeader}>
          <div className={styles.tabs}>
            <div
              className={`${styles.tabsIndicator} ${
                activeTab === "shared-to-me" ? styles.tabsIndicator_second : ""
              }`}
            />
            <button
              type="button"
              className={`${styles.tab} ${
                activeTab === "my-places" ? styles.tab_active : ""
              }`}
              onClick={() => {
                setDraftSearch(null);
                updateQueryParams({ tab: "my-places", q: null });
              }}
            >
              My places
            </button>
            <button
              type="button"
              className={`${styles.tab} ${
                activeTab === "shared-to-me" ? styles.tab_active : ""
              }`}
              onClick={() => {
                setDraftSearch(null);
                updateQueryParams({ tab: "shared-to-me", q: null });
              }}
            >
              Shared to me
            </button>
          </div>

          <div className={styles.searchBarWrapper}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder={
                activeTab === "my-places"
                  ? "Search my places..."
                  : searchType === "name"
                  ? "Search by place name..."
                  : "Search by creator name..."
              }
              value={searchInputValue}
              onChange={(e) => setDraftSearch(e.target.value)}
            />

            <div
              className={`${styles.searchTypeSwitch} ${
                activeTab !== "shared-to-me" ? styles.searchTypeSwitch_hidden : ""
              }`}
            >
              <div
                className={`${styles.switchIndicator} ${
                  searchType === "user" ? styles.switchIndicator_second : ""
                }`}
              />
              <button
                type="button"
                className={`${styles.switchBtn} ${
                  searchType === "name" ? styles.switchBtn_active : ""
                }`}
                onClick={() => updateQueryParams({ searchType: "name" })}
              >
                By Place
              </button>
              <button
                type="button"
                className={`${styles.switchBtn} ${
                  searchType === "user" ? styles.switchBtn_active : ""
                }`}
                onClick={() => updateQueryParams({ searchType: "user" })}
              >
                By User
              </button>
            </div>
          </div>
        </aside>

        {/* Separate Filters Section (Categories & Tags) for Shared to me */}
        {activeTab === "shared-to-me" && (
          <div className={styles.dropdownFiltersContainer}>
            <div className={styles.dropdownFilters}>
              <FilterDropdown
                label={selectedCategoryLabel}
                isOpen={isCategoryDropdownOpen}
                wrapperRef={categoryDropdownRef}
                options={categoryOptions}
                onToggle={() => {
                  setIsCategoryDropdownOpen((prev) => !prev);
                  setIsTagDropdownOpen(false);
                }}
                onSelect={(value) => {
                  updateQueryParams({ category: value });
                  setIsCategoryDropdownOpen(false);
                }}
              />

              <FilterDropdown
                label={selectedTagLabel}
                isOpen={isTagDropdownOpen}
                wrapperRef={tagDropdownRef}
                options={tagOptions}
                keepOpenOnSelect
                onToggle={() => {
                  setIsTagDropdownOpen((prev) => !prev);
                  setIsCategoryDropdownOpen(false);
                }}
                onSelect={(value) => {
                  if (value === "") {
                    updateQueryParams({ tags: null });
                  } else {
                    handleTagToggle(value);
                  }
                }}
              />
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                className={styles.clearAllBtn}
                onClick={handleClearAll}
              >
                Clear All
              </button>
            )}
          </div>
        )}

        {/* Places Section */}
        <section className={styles.placesSection}>
          {isEmptyList ? (
            <p className={styles.placesSection__empty}>
              {activeTab === "my-places"
                ? urlSearchQuery
                  ? "No places match your search."
                  : "You haven't added any places yet."
                : savedPlaces.length === 0
                ? "No places available on the map yet."
                : "No places match your search or filter criteria."}
            </p>
          ) : (
            <>
              <div className={styles.placesGrid}>
                {paginatedPlaces.map((place) => {
                  const isMyPlace =
                    Boolean(currentUserId) && place.creator_id === currentUserId;
                  const canManage = activeTab === "my-places" || isMyPlace;
                  const placeImage =
                    Object.values(place.photos ?? {}).find((p) => p.url)?.url ??
                    "";

                  return (
                    <PlaceCard
                      key={`${place.id}_${placeImage}`}
                      image={placeImage}
                      title={place.name}
                      category={place.categoryName}
                      workingHours={
                        place.opening_hours
                          ? `${place.opening_hours.opens_at}\n${place.opening_hours.closes_at}`
                          : "none"
                      }
                      {...(activeTab === "my-places"
                        ? { isShared: 0 }
                        : { addedBy: place.creator_name })}
                      deleteButtonText="Delete place"
                      onEdit={canManage ? () => setPlaceToEdit(place) : undefined}
                      onShare={
                        canManage ? () => handleOpenShare(place) : undefined
                      }
                      onDelete={
                        canManage ? () => handleDeletePersonal(place) : undefined
                      }
                      onClick={() => navigate(`/places/${place.id}`)}
                    />
                  );
                })}
              </div>

              {shouldShowPagination && (
                <Pagination
                  pageSize={pageSize}
                  pageSizeOptions={PAGE_SIZE_OPTIONS}
                  currentPage={safeCurrentPage}
                  totalPages={totalPages}
                  onPageSizeChange={handlePageSizeChange}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          )}
        </section>
      </div>

      {/* Modals & Notifications */}

      <ConfirmForm
        isOpen={!!placeToDelete}
        title="Delete place"
        message={
          <>
            <strong>{placeToDelete?.name}</strong> will be removed from the map
            and from all groups it was shared with.
            <br />
            <span>This can’t be undone.</span>
          </>
        }
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="danger"
        onConfirm={handleConfirmDeletePersonal}
        onClose={handleCancelDelete}
      />

      <EditProfile
        key={currentUser?.avatar + (isEditModalOpen ? "_open" : "_closed")}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        currentName={currentUser?.name || ""}
        currentAvatar={currentUser?.avatar}
        onSave={handleSaveProfile}
      />

      {placeToEdit && (
        <EditPlaceModal
          key={placeToEdit.id}
          isOpen={!!placeToEdit}
          onClose={() => setPlaceToEdit(null)}
          place={placeToEdit}
          onUpdate={handlePlaceUpdated}
        />
      )}

      {error && <p className={styles.PersonalRoom__error}>{error}</p>}
    </main>
  );
};

export default PersonalRoom;