import { useState } from "react";
import { useAppDispatch } from "@/store/hooks";
import { mapActions } from "@/store/index";
import { placeService } from "@/services/placeService";
import type { Place } from "@/types";

export const usePlaceCardActions = (onPlaceDeleted?: (placeId: string) => void) => {
  const dispatch = useAppDispatch();

  // ==========================================
  // STATE MANAGEMENT
  // ==========================================
  
  // Шерінг місць
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [placeToShare, setPlaceToShare] = useState<Place | null>(null);
  
  // Видалення місць (модальне вікно підтвердження)
  const [placeToDelete, setPlaceToDelete] = useState<Place | null>(null);

  // ==========================================
  // SHARE ACTIONS
  // ==========================================

  const handleOpenShare = (place: Place) => {
    setPlaceToShare(place);
    setIsShareModalOpen(true);
  };

  const handleCloseShare = () => {
    setIsShareModalOpen(false);
    setPlaceToShare(null);
  };

  const handleConfirmShare = (groupId: string) => {
    if (!placeToShare) return;
    console.log("Share place to group backend pending:", groupId, placeToShare.id);
    handleCloseShare();
  };

  // ==========================================
  // DELETE ACTIONS
  // ==========================================

  // Відкриває модальне вікно підтвердження для персонального місця
  const handleDeletePersonal = (place: Place) => {
    setPlaceToDelete(place);
  };

  // Виконується при підтвердженні видалення у модалці
  const handleConfirmDeletePersonal = async () => {
    if (!placeToDelete) return;
    
    try {
      await placeService.delete(placeToDelete.id);
      dispatch(mapActions.removePlace(placeToDelete.id));
      
      if (onPlaceDeleted) {
        onPlaceDeleted(placeToDelete.id);
      }
    } catch (err) {
      console.error("Failed to delete place on server:", err);
    } finally {
      setPlaceToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setPlaceToDelete(null);
  };

  // Видалення місця з групи [ПОТРІБНЕ ДОПРАЦЮВАННЯ БЕКЕНДУ ДЛЯ ГРУП]
  const handleDeleteGroupPlace = (groupId: string, placeId: string) => {
    console.log("Delete place from group backend pending:", groupId, placeId);
  };

  // ==========================================
  // EDIT ACTIONS
  // ==========================================

  const handleEdit = (place: Place) => {
    console.log("Edit place triggered:", place.id);
  };

  // ==========================================
  // RETURN VALUES
  // ==========================================

  return {
    isShareModalOpen,
    placeToShare,
    placeToDelete,
    handleOpenShare,
    handleCloseShare,
    handleConfirmShare,
    handleDeletePersonal,
    handleConfirmDeletePersonal,
    handleCancelDelete,
    handleDeleteGroupPlace,
    handleEdit,
  };
};