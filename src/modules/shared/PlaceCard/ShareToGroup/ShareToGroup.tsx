// import React from "react";
// import styles from "./ShareToGroup.module.scss";
// import Icon from "@/modules/shared/Icon";
// import type { Group } from "@/types";

// interface ShareToGroupProps {
//   isOpen: boolean;
//   onClose: () => void;
//   groups: Group[];
//   onSelectGroup: (groupId: number) => void;
// }

// const ShareToGroup: React.FC<ShareToGroupProps> = ({
//   isOpen,
//   onClose,
//   groups,
//   onSelectGroup,
// }) => {
//   if (!isOpen) return null;

//   return (
//     <div className={styles.overlay} onClick={onClose}>
//       <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
//         <div className={styles.modal__header}>
//           <h3 className={styles.modal__title}>Share with group</h3>
//           <button className={styles.modal__closeBtn} onClick={onClose} type="button">
//             <Icon name="close" size={20} />
//           </button>
//         </div>

//         <div className={styles.modal__content}>
//           {groups.length === 0 ? (
//             <p className={styles.modal__empty}>You don't have any groups yet. Create one first!</p>
//           ) : (
//             <div className={styles.modal__groupsList}>
//               {groups.map((group) => (
//                 <div
//                   key={group.id}
//                   className={styles.modal__groupItem}
//                   onClick={() => {
//                     onSelectGroup(group.id);
//                     onClose();
//                   }}
//                 >
//                   <div className={styles.modal__groupInfo}>
//                     <span className={styles.modal__groupName}>{group.name}</span>
//                     <span className={styles.modal__groupMembers}>
//                       {group.members.length} {group.members.length === 1 ? "member" : "members"}
//                     </span>
//                   </div>
//                   <span className={styles.modal__shareAction}>Share</span>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ShareToGroup;