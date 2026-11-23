import styles from "./PersonalRoom.module.scss";

import type { AxiosError } from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useRef, useState, useMemo } from "react";
import { useAppDispatch, useAuthSelector, useMapSelector } from "@/store/hooks";
import { usePlaceCardActions } from "../usePlaceCardActions";
import { authActions, mapActions } from "@/store";
import { usePageError } from "../hooks.ts";

import PlaceCard from "../shared/PlaceCard";
import type { Place } from "@/types/index.ts";
import { Tag } from "@/types/index.ts";
import ConfirmForm from "../shared/ConfirmForm/ConfirmForm.tsx";
import Icon from "../shared/Icon";
import Loader from "@/modules/shared/Loader";
import EditProfile from "./EditProfileModal/EditProfileModal.tsx";
import EditPlaceModal from "../shared/PlaceCard/EditPlace/index.ts";
import { userService } from "@/services/userService.ts";

const PersonalRoom = () => {

  // ==========================================
  // HOOKS & SELECTORS
  // ==========================================

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { currentUser } = useAuthSelector();
  const [error, setError] = usePageError("");
  const [searchParams, setSearchParams] = useSearchParams();

  // ==========================================
  // URL PARAMS & STATES
  // ==========================================

  const activeTab = (searchParams.get("tab") as "my-places" | "shared-to-me") || "my-places";
  const searchQuery = searchParams.get("q") || "";
  const searchType = (searchParams.get("searchType") as "name" | "user") || "name";
  const selectedCategory = searchParams.get("category") || "all";

  const selectedTags = useMemo(() => {
    const tagsParam = searchParams.get("tags");
    return tagsParam ? tagsParam.split(",") : [];
  }, [searchParams]);

  const groupsCount = 0;
  const [myPlaces, setMyPlaces] = useState<Place[]>([]);
  const [isLoadingMyPlaces, setIsLoadingMyPlaces] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAvatarLoaded, setIsAvatarLoaded] = useState(false);
  
  const imgRef = useRef<HTMLImageElement>(null);
  const [placeToEdit, setPlaceToEdit] = useState<Place | null>(null);

  // States for custom dropdowns visibility & refs for outside click
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);

  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const tagDropdownRef = useRef<HTMLDivElement>(null);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    setIsAvatarLoaded(!!imgRef.current?.complete);
  }, [currentUser?.avatar]);

  // ==========================================
  // QUERY PARAMS HELPER
  // ==========================================

  const updateQueryParams = (updates: Record<string, string | null>) => {
    const newParams = new URLSearchParams(searchParams);
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "" || value === "all") {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    });

    setSearchParams(newParams, { replace: true });
  };

  // Close custom dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setIsCategoryDropdownOpen(false);
      }
      if (tagDropdownRef.current && !tagDropdownRef.current.contains(event.target as Node)) {
        setIsTagDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ==========================================
  // CARD ACTIONS & SELECTORS
  // ==========================================

  const {
    placeToDelete,
    handleOpenShare,
    handleDeletePersonal,
    handleConfirmDeletePersonal,
    handleCancelDelete,
  } = usePlaceCardActions((deletedId) => {
    setMyPlaces((prev) => prev.filter((p) => p.id !== deletedId));
  });

  const { savedPlaces } = useMapSelector();

  // ==========================================
  // EFFECTS (DATA FETCHING & TIMERS)
  // ==========================================

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    let isMounted = true;

    const fetchUserOnce = async () => {
      try {
        const userProfile = await userService.getMe();
        if (isMounted) {
          dispatch(authActions.updateUser(userProfile));
        }
      } catch (err) {
        console.error("Failed to fetch user profile:", err);
      }
    };

    fetchUserOnce();

    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  useEffect(() => {
    const fetchMyPlaces = async () => {
      if (!currentUser?.id) return;
      try {
        setIsLoadingMyPlaces(true);
        const userPersonalPlaces = savedPlaces.filter(
          (place) => place.creator_id === currentUser.id,
        );
        setMyPlaces(userPersonalPlaces);
      } catch (err) {
        console.error("Failed to load my places:", err);
      } finally {
        setIsLoadingMyPlaces(false);
      }
    };

    fetchMyPlaces();
  }, [currentUser?.id, savedPlaces]);

  useEffect(() => {
    if (!error) return;
    const timerId = setTimeout(() => {
      navigate("/");
    }, 3000);
    return () => clearTimeout(timerId);
  }, [navigate, error]);

  // ==========================================
  // FILTERING & DERIVED DATA
  // ==========================================

  // Extract unique categories for filter options
  const availableCategories = useMemo(() => {
    const categoriesSet = new Set<string>();
    savedPlaces.forEach((p) => {
      if (p.categoryName) categoriesSet.add(p.categoryName);
    });
    return Array.from(categoriesSet);
  }, [savedPlaces]);

  // Filtered My Places
  const filteredMyPlaces = useMemo(() => {
    return myPlaces.filter((place) => {
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const matchName = place.name?.toLowerCase().includes(query);
        if (!matchName) return false;
      }
      return true;
    });
  }, [myPlaces, searchQuery]);

  // Filtered Shared Places
  const filteredSharedPlaces = useMemo(() => {
    return savedPlaces.filter((place) => {
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        if (searchType === "name") {
          const matchName = place.name?.toLowerCase().includes(query);
          if (!matchName) return false;
        } else if (searchType === "user") {
          const matchUser = place.creator_name?.toLowerCase().includes(query);
          if (!matchUser) return false;
        }
      }

      if (selectedCategory !== "all" && place.categoryName !== selectedCategory) {
        return false;
      }

      // Фільтрація за тегами: місце повинно мати ВСІ обрані теги
      if (selectedTags.length > 0) {
        if (!place.tags || !selectedTags.every((tag) => place.tags?.includes(tag as keyof typeof Tag))) {
          return false;
        }
      }

      return true;
    });
  }, [savedPlaces, searchQuery, searchType, selectedCategory, selectedTags]);

  // ==========================================
  // EVENT HANDLERS
  // ==========================================

  const handlePlaceUpdated = (updatedPlace: Place) => {
    setMyPlaces((prevPlaces) =>
      prevPlaces.map((p) => (p.id === updatedPlace.id ? updatedPlace : p))
    );

    dispatch(mapActions.updatePlace(updatedPlace));
  };

  const placesCount = myPlaces.length;

  const handleLogout = async () => {
    try {
      await dispatch(authActions.logout()).unwrap();
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      setError(error.response?.data?.message ?? "");
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
    } catch (error: unknown) {
      console.error("Failed to update profile:", error);
      throw error;
    }
  };

  const handleClearAll = () => {
    setSearchParams({ tab: activeTab }, { replace: true });
  };

  const handleTagToggle = (tagKey: string) => {
    const updatedTags = selectedTags.includes(tagKey)
      ? selectedTags.filter((t) => t !== tagKey)
      : [...selectedTags, tagKey];

    updateQueryParams({ tags: updatedTags.length > 0 ? updatedTags.join(",") : null });
  };

  // Labels for custom dropdown triggers
  const selectedCategoryLabel = selectedCategory === "all" ? "All Categories" : selectedCategory;
  const selectedTagLabel =
    selectedTags.length === 0
      ? "All Tags"
      : selectedTags.length === 1
      ? Tag[selectedTags[0] as keyof typeof Tag] || selectedTags[0]
      : `${selectedTags.length} tags selected`;

  // Перевірка чи є активні фільтри для показу кнопки Clear All
  const hasActiveFilters = searchQuery.trim() !== "" || selectedCategory !== "all" || selectedTags.length > 0 || searchType !== "name";

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

              {/* Патерн-заглушка */}

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

              {/* Картинка аватара */}

              {currentUser?.avatar && (
                <img
                  ref={imgRef}
                  src={currentUser.avatar}
                  alt="User avatar"
                  className={`${styles.personalInfo__avatar} ${
                    isAvatarLoaded
                      ? styles.personalInfo__avatarLoaded
                      : styles.personalInfo__avatarHidden
                  }`}
                  onLoad={() => setIsAvatarLoaded(true)}
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
                <span className={styles.personalInfo__separator}>•</span>
                <span>
                  {groupsCount} groups
                </span>
              </div>
            </div>
          </div>

          <div className={styles.personalInfo__buttons}>
            <button
              className={styles.personalInfo__buttons__edit}
              onClick={() => setIsEditModalOpen(true)}
            >
              <Icon
                name="edit"
                size={20}
              />
              <span>Edit</span>
            </button>
            <button
              className={styles.personalInfo__buttons__logout}
              onClick={handleLogout}
            >
              <Icon
                name="exit"
                size={20}
              />
              <span>
                Log out
              </span>
            </button>
          </div>
        </div>

        {/* Controls Header: Tabs + Search Bar on the same level */}

        <div className={styles.controlsHeader}>

          {/* Tabs Navigation */}

          <div className={styles.tabs}>
            <div 
              className={`${styles.tabsIndicator} ${
                activeTab === "shared-to-me" ? styles.tabsIndicator_second : ""
              }`} 
            />
            <button
              type="button"
              className={`${styles.tab} ${activeTab === "my-places" ? styles.tab_active : ""}`}
              onClick={() => updateQueryParams({ tab: "my-places", q: null })}
            >
              My places
            </button>
            <button
              type="button"
              className={`${styles.tab} ${activeTab === "shared-to-me" ? styles.tab_active : ""}`}
              onClick={() => updateQueryParams({ tab: "shared-to-me", q: null })}
            >
              Shared to me
            </button>
          </div>

          {/* Search Bar & Switcher */}

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
              value={searchQuery}
              onChange={(e) => updateQueryParams({ q: e.target.value })}
            />

            <div className={`${styles.searchTypeSwitch} ${activeTab !== "shared-to-me" ? styles.searchTypeSwitch_hidden : ""}`}>
              <div 
                className={`${styles.switchIndicator} ${
                  searchType === "user" ? styles.switchIndicator_second : ""
                }`} 
              />
              <button
                type="button"
                className={`${styles.switchBtn} ${searchType === "name" ? styles.switchBtn_active : ""}`}
                onClick={() => updateQueryParams({ searchType: "name" })}
              >
                By Place
              </button>
              <button
                type="button"
                className={`${styles.switchBtn} ${searchType === "user" ? styles.switchBtn_active : ""}`}
                onClick={() => updateQueryParams({ searchType: "user" })}
              >
                By User
              </button>
            </div>
          </div>
        </div>

        {/* Separate Filters Section (Categories & Tags) for Shared to me */}

        {activeTab === "shared-to-me" && (
          <div className={styles.dropdownFiltersContainer}>
            <div className={styles.dropdownFilters}>
              
              {/* Category Custom Dropdown */}
              <div className={styles.customSelectWrapper} ref={categoryDropdownRef}>
                <button
                  type="button"
                  className={styles.filterSelect}
                  onClick={() => {
                    setIsCategoryDropdownOpen((prev) => !prev);
                    setIsTagDropdownOpen(false);
                  }}
                >
                  <span>{selectedCategoryLabel}</span>
                  <Icon name="down" size={16} className={`${styles.selectArrow} ${isCategoryDropdownOpen ? styles.selectArrow_open : ""}`} />
                </button>

                {isCategoryDropdownOpen && (
                  <div className={styles.customDropdownMenu}>
                    <button
                      type="button"
                      className={`${styles.customDropdownItem} ${selectedCategory === "all" ? styles.customDropdownItem_active : ""}`}
                      onClick={() => {
                        updateQueryParams({ category: "all" });
                        setIsCategoryDropdownOpen(false);
                      }}
                    >
                      All Categories
                    </button>
                    {availableCategories.map((category) => (
                      <button
                        key={category}
                        type="button"
                        className={`${styles.customDropdownItem} ${selectedCategory === category ? styles.customDropdownItem_active : ""}`}
                        onClick={() => {
                          updateQueryParams({ category: category });
                          setIsCategoryDropdownOpen(false);
                        }}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Tag Custom Dropdown (Multi-select) */}
              <div className={styles.customSelectWrapper} ref={tagDropdownRef}>
                <button
                  type="button"
                  className={styles.filterSelect}
                  onClick={() => {
                    setIsTagDropdownOpen((prev) => !prev);
                    setIsCategoryDropdownOpen(false);
                  }}
                >
                  <span>{selectedTagLabel}</span>
                  <Icon name="down" size={16} className={`${styles.selectArrow} ${isTagDropdownOpen ? styles.selectArrow_open : ""}`} />
                </button>

                {isTagDropdownOpen && (
                  <div className={styles.customDropdownMenu}>
                    <button
                      type="button"
                      className={`${styles.customDropdownItem} ${selectedTags.length === 0 ? styles.customDropdownItem_active : ""}`}
                      onClick={() => {
                        updateQueryParams({ tags: null });
                      }}
                    >
                      All Tags
                    </button>
                    {Object.keys(Tag).map((tagKey) => {
                      const isSelected = selectedTags.includes(tagKey);
                      return (
                        <button
                          key={tagKey}
                          type="button"
                          className={`${styles.customDropdownItem} ${isSelected ? styles.customDropdownItem_active : ""}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTagToggle(tagKey);
                          }}
                        >
                          <span className={styles.checkboxIndicator}>{isSelected ? "✓ " : ""}</span>
                          {Tag[tagKey as keyof typeof Tag] || tagKey}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>

            {/* Clear All Button */}
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
          {activeTab === "my-places" ? (
            isLoadingMyPlaces ? (
              <p className={styles.placesSection__empty}>
                Loading your places...
              </p>
            ) : filteredMyPlaces.length === 0 ? (
              <p className={styles.placesSection__empty}>
                {searchQuery ? "No places match your search." : "You haven't added any places yet."}
              </p>
            ) : (
              <div className={styles.placesGrid}>
                {filteredMyPlaces.map((place) => {
                  let placeImage = "";
                  if (place.photos) {
                    for (let i = 0; i < 5; i++) {
                      if (place.photos?.[i]?.url) {
                        placeImage = place.photos[i].url;
                        break;
                      }
                    }
                  }

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
                      isShared={0}
                      deleteButtonText="Delete place"
                      onEdit={() => setPlaceToEdit(place)}
                      onShare={() => handleOpenShare(place)}
                      onDelete={() => handleDeletePersonal(place)}
                      onClick={() => navigate(`/places/${place.id}`)}
                    />
                  );
                })}
              </div>
            )
          ) : (
            savedPlaces.length === 0 ? (
              <p className={styles.placesSection__empty}>
                No places available on the map yet.
              </p>
            ) : filteredSharedPlaces.length === 0 ? (
              <p className={styles.placesSection__empty}>
                No places match your search or filter criteria.
              </p>
            ) : (
              <div className={styles.placesGrid}>
                {filteredSharedPlaces.map((place) => {
                  const isMyPlace = currentUser?.id && place.creator_id === currentUser.id;
                  let placeImage = "";

                  if (place.photos) {
                    for (let i = 0; i < 5; i++) {
                      if (place.photos?.[i]?.url) {
                        placeImage = place.photos[i].url;
                        break;
                      }
                    }
                  }

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
                      addedBy={place.creator_name} 
                      deleteButtonText="Delete place"
                      onEdit={isMyPlace ? () => setPlaceToEdit(place) : undefined}
                      onShare={isMyPlace ? () => handleOpenShare(place) : undefined}
                      onDelete={isMyPlace ? () => handleDeletePersonal(place) : undefined}
                      onClick={() => navigate(`/places/${place.id}`)}
                    />
                  );
                })}
              </div>
            )
          )}
        </section>
      </div>

      {/* Modals & Notifications */}

      <ConfirmForm
        isOpen={!!placeToDelete}
        title="Delete place"
        message={
          <>
            <strong>{placeToDelete?.name}</strong>
            {" "}will be removed from the map and from all groups it was shared with.
            <br/>
            <p>This can’t be undone.</p>
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