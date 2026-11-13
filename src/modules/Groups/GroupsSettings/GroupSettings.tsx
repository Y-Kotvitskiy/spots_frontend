// import React, { useState } from "react";
// import styles from "./GroupSettings.module.scss";
// import Icon from "@/modules/shared/Icon";
// import FormButton from "@/modules/AuthContainer/FormButton";
// import type { Group, InvitePermission } from "@/types";

// interface GroupSettingsProps {
//   isOpen: boolean;
//   group: Group;
//   currentUserId: number;
//   onClose: () => void;
//   onSave: (name: string, description: string, whoCanInvite: InvitePermission) => void;
//   onLeave: () => void;
//   onDelete: () => void;
// }

// const GroupSettings: React.FC<GroupSettingsProps> = ({
//   isOpen,
//   group,
//   currentUserId,
//   onClose,
//   onSave,
//   onLeave,
//   onDelete,
// }) => {
//   const [name, setName] = useState(group.name);
//   const [description, setDescription] = useState(group.description || "");
//   const [whoCanInvite, setWhoCanInvite] = useState<InvitePermission>(group.whoCanInvite);
  
//   // Стан для відображення екрана підтвердження видалення
//   const [isDeleteConfirm, setIsDeleteConfirm] = useState(false);

//   if (!isOpen) return null;

//   const isAdmin = group.creator_id === currentUserId;

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     onSave(name, description, whoCanInvite);
//     onClose();
//   };

//   return (
//     <div className={styles.overlay} onClick={onClose}>
//       <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
//         {/* Header section start */}
//         <div className={styles.modal__header}>
//           <h3 className={styles.modal__title}>Group settings</h3>
//           <button 
//             className={styles.modal__closeBtn} 
//             onClick={() => {
//               setIsDeleteConfirm(false); // Скидаємо стан при закритті
//               onClose();
//             }} 
//             type="button" 
//             aria-label="Close modal"
//           >
//             <Icon name="close" size={24} />
//           </button>
//         </div>
//         {/* Header section end */}

//         {isDeleteConfirm ? (
//           /* Delete confirmation view start */
//           <div className={styles.modal__confirmContainer}>
//             <div className={styles.modal__confirmTextWrapper}>
//               <p className={styles.modal__confirmText}>
//                 This will permanently delete the group and remove it for all members.
//               </p>
//               <p className={styles.modal__confirmSubText}>
//                 Places will stay in their owners' accounts.
//               </p>
//             </div>

//             <div className={styles.modal__confirmActions}>
//               <button
//                 type="button"
//                 className={styles.modal__cancelBtn}
//                 onClick={() => setIsDeleteConfirm(false)}
//               >
//                 Cancel
//               </button>
//               <button
//                 type="button"
//                 className={styles.modal__deleteBtn}
//                 onClick={() => {
//                   onDelete();
//                   setIsDeleteConfirm(false);
//                 }}
//               >
//                 Delete
//               </button>
//             </div>
//           </div>
//           /* Delete confirmation view end */
//         ) : (
//           /* Form section start */
//           <form onSubmit={handleSubmit} className={styles.modal__form}>
//             <div className={styles.modal__field}>
//               <label className={styles.modal__label}>
//                 Group name <span className={styles.modal__required}>*</span>
//               </label>
//               <input
//                 type="text"
//                 value={name}
//                 onChange={(e) => setName(e.target.value)}
//                 className={styles.modal__input}
//                 required
//               />
//             </div>

//             <div className={styles.modal__field}>
//               <label className={styles.modal__label}>Description</label>
//               <textarea
//                 value={description}
//                 onChange={(e) => setDescription(e.target.value)}
//                 placeholder="Tell people what makes this place special"
//                 className={styles.modal__textarea}
//               />
//             </div>

//             <div className={styles.modal__radioGroup}>
//               <label className={styles.modal__label}>Who can invite people</label>
              
//               <label className={styles.modal__radioOption}>
//                 <span>Admins only</span>
//                 <input
//                   type="radio"
//                   name="whoCanInvite"
//                   checked={whoCanInvite === "admins-only"}
//                   onChange={() => setWhoCanInvite("admins-only")}
//                   className={styles.modal__radioInput}
//                 />
//               </label>

//               <label className={styles.modal__radioOption}>
//                 <span>All members</span>
//                 <input
//                   type="radio"
//                   name="whoCanInvite"
//                   checked={whoCanInvite === "all-members"}
//                   onChange={() => setWhoCanInvite("all-members")}
//                   className={styles.modal__radioInput}
//                 />
//               </label>
//             </div>

//             <div className={styles.modal__dangerZone}>
//               <h4 className={styles.modal__dangerTitle}>Danger zone</h4>
//               <button type="button" className={styles.modal__dangerBtn} onClick={onLeave}>
//                 Leave group
//               </button>
//               {isAdmin && (
//                 <button 
//                   type="button" 
//                   className={styles.modal__dangerBtnRed} 
//                   onClick={() => setIsDeleteConfirm(true)} // Відкриваємо екран підтвердження
//                 >
//                   Delete group
//                 </button>
//               )}
//             </div>

//             <FormButton type="submit" text="Save changes" />
//           </form>
//           /* Form section end */
//         )}
//       </div>
//     </div>
//   );
// };

// export default GroupSettings;