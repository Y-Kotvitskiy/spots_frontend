import { useState } from "react";
import { useAppDispatch } from "@/store/hooks";
import { groupActions } from "@/store/slices/groupSlice";
import { mapActions } from "@/store/index";
import type { Place } from "@/types";

export const usePlaceCardActions = () => {
  const dispatch = useAppDispatch();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [placeToShare, setPlaceToShare] = useState<Place | null>(null);

  // Відкриття модалки шерінгу
  const handleOpenShare = (place: Place) => {
    setPlaceToShare(place);
    setIsShareModalOpen(true);
  };

  // Закриття модалки шерінгу
  const handleCloseShare = () => {
    setIsShareModalOpen(false);
    setPlaceToShare(null);
  };

  // Підтвердження поширення у вибрану групу
  const handleConfirmShare = (groupId: number) => {
    if (!placeToShare) return;
    dispatch(groupActions.sharePlaceToGroup({ groupId, place: placeToShare }));
    handleCloseShare();
  };

  // Видалення місця з особистих (PersonalRoom)
  const handleDeletePersonal = (placeId: string | number) => {
    if (confirm("Are you sure you want to delete this place?")) {
      dispatch(mapActions.removePlace(placeId));
    }
  };

  // Видалення (прибирання) місця з групи (Groups)
  const handleDeleteGroupPlace = (groupId: number, placeId: number) => {
    if (confirm("Are you sure you want to remove this place from the group?")) {
      dispatch(groupActions.removePlaceFromGroup({ groupId, placeId }));
    }
  };

  // Редагування місця
  const handleEdit = (place: Place) => {
    console.log("Edit place:", place.id);
  };

  return {
    isShareModalOpen,
    placeToShare,
    handleOpenShare,
    handleCloseShare,
    handleConfirmShare,
    handleDeletePersonal,
    handleDeleteGroupPlace,
    handleEdit,
  };
};
