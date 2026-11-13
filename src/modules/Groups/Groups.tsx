// import React, { useState, useRef, useEffect } from "react";
// import styles from "./Groups.module.scss";
// import { useAppDispatch, useAppSelector } from "@/store/hooks";
// import {
//   selectGroups,
//   selectSelectedGroup,
//   groupActions,
// } from "@/store/slices/groupSlice";
// import PlaceCard from "../shared/PlaceCard/PlaceCard";
// import ShareToGroup from "../shared/PlaceCard/ShareToGroup";
// import Icon from "../shared/Icon/Icon";
// import GroupSettingsModal from "./GroupsSettings/GroupSettings";
// import CreateGroup from "./CreateGroup";
// import { usePlaceCardActions } from "@/modules/usePlaceCardActions";
// import type { Group, GroupMember, Place } from "@/types";

// const Groups: React.FC = () => {
//   const dispatch = useAppDispatch();
//   const groups = useAppSelector(selectGroups);
//   const selectedGroup = useAppSelector(selectSelectedGroup);

//   const { currentUser } = useAppSelector((state) => state.auth);
//   const [activeTab, setActiveTab] = useState<"places" | "members">("places");
//   const [isSettingsOpen, setIsSettingsOpen] = useState(false);
//   const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

//   // Стан для модалки видалення учасника
//   const [memberToRemove, setMemberToRemove] = useState<{
//     id: string;
//     name: string;
//   } | null>(null);

//   const [memberSearchQuery, setMemberSearchQuery] = useState("");
//   const [openMenuMemberId, setOpenMenuMemberId] = useState<
//     string | number | null
//   >(null);
//   const menuRef = useRef<HTMLDivElement>(null);

//   // Select the first group by default only on desktop if no group is currently selected
//   useEffect(() => {
//     const isDesktop = window.innerWidth >= 1200;
//     if (isDesktop && !selectedGroup && groups.length > 0) {
//       dispatch(groupActions.setSelectedGroup(groups[0]));
//     }
//   }, [groups, selectedGroup, dispatch]);

//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
//         setOpenMenuMemberId(null);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const {
//     isShareModalOpen,
//     handleOpenShare,
//     handleCloseShare,
//     handleConfirmShare,
//     handleDeleteGroupPlace,
//     handleEdit: handleCardEdit,
//   } = usePlaceCardActions();

//   const handleCreateGroup = (name: string, description: string) => {
//     if (!currentUser) return;

//     dispatch(
//       groupActions.createGroup({
//         name,
//         description,
//         creator: {
//           id: currentUser.id,
//           name: currentUser.name,
//           avatar: currentUser.avatar,
//         },
//         whoCanInvite: "all-members",
//       }),
//     );
//   };

//   const handleInvite = () => {
//     if (!selectedGroup) return;
//     dispatch(
//       groupActions.addMemberToGroup({
//         groupId: selectedGroup.id,
//         member: {
//           id: Date.now(),
//           name: "Олексій Петренко",
//           avatar:
//             "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde",
//           isAdmin: false,
//         },
//       }),
//     );
//   };

//   const handleMakeAdmin = (memberId: string | number) => {
//     console.log("Make admin:", memberId);
//     setOpenMenuMemberId(null);
//   };

//   const handleRemoveMember = (memberId: number, memberName: string) => {
//     setMemberToRemove({ id: memberId, name: memberName });
//     setOpenMenuMemberId(null);
//   };

//   const handleConfirmRemoveMember = () => {
//     if (!selectedGroup || !memberToRemove) return;

//     dispatch(
//       groupActions.removeMemberFromGroup({
//         groupId: selectedGroup.id,
//         memberId: memberToRemove.id,
//       }),
//     );
//     setMemberToRemove(null);
//   };

//   const handleSaveSettings = (
//     name: string,
//     description: string,
//     whoCanInvite: "admins-only" | "all-members",
//   ) => {
//     if (!selectedGroup) return;
//     dispatch(
//       groupActions.updateGroup({
//         groupId: selectedGroup.id,
//         name,
//         description,
//         whoCanInvite,
//       }),
//     );
//   };

//   const handleDeleteGroup = () => {
//     if (!selectedGroup || !currentUser) return;

//     const isAdmin = selectedGroup.creator_id === currentUser.id;
//     if (!isAdmin) {
//       alert("Only the group creator can delete this group.");
//       return;
//     }

//     dispatch(groupActions.deleteGroup(selectedGroup.id));
//     setIsSettingsOpen(false);
//     dispatch(groupActions.setSelectedGroup(null));
//   };

//   const handleLeaveGroup = () => {
//     if (!selectedGroup || !currentUser) return;

//     dispatch(
//       groupActions.removeMemberFromGroup({
//         groupId: selectedGroup.id,
//         memberId: currentUser.id,
//       }),
//     );

//     setIsSettingsOpen(false);
//     dispatch(groupActions.setSelectedGroup(null));
//   };

//   const filteredMembers =
//     selectedGroup?.members.filter((member: GroupMember) =>
//       member.name.toLowerCase().includes(memberSearchQuery.toLowerCase()),
//     ) || [];

//   if (groups.length === 0) {
//     return (
//       <main className={styles.GroupsPage}>
//         <div className={styles.container}>
//           <div className={styles.sidebar}>
//             <button
//               className={styles.createBtn}
//               onClick={() => setIsCreateModalOpen(true)}
//             >
//               <Icon name="plus" size={32} />
//               <span>Create group</span>
//             </button>
//           </div>
//           <div className={styles.emptyState}>
//             <h2>No groups yet</h2>
//             <p>Groups let you share places with like-minded people.</p>
//           </div>
//         </div>

//         <CreateGroup
//           isOpen={isCreateModalOpen}
//           onClose={() => setIsCreateModalOpen(false)}
//           onCreate={handleCreateGroup}
//         />
//       </main>
//     );
//   }

//   return (
//     <main className={styles.GroupsPage}>
//       <div className={styles.container}>
//         {/* Sidebar section start */}
//         <aside
//           className={`${styles.sidebar} ${selectedGroup ? styles.sidebar_hasSelected : ""}`}
//         >
//           <button
//             className={styles.createBtn}
//             onClick={() => setIsCreateModalOpen(true)}
//           >
//             <Icon name="plus" size={24} />
//             <span>Create group</span>
//           </button>

//           <div className={styles.myGroupsBlock}>
//             <span className={styles.myGroupsTitle}>My groups</span>
//             <div className={styles.groupsList}>
//               {groups.map((group: Group) => (
//                 <div
//                   key={group.id}
//                   className={`${styles.groupItem} ${
//                     selectedGroup?.id === group.id
//                       ? styles.groupItem_active
//                       : ""
//                   }`}
//                   onClick={() => dispatch(groupActions.setSelectedGroup(group))}
//                 >
//                   <div className={styles.groupItem__info}>
//                     <span className={styles.groupItem__name}>{group.name}</span>
//                     <span className={styles.groupItem__stats}>
//                       {group.members.length} members
//                     </span>
//                   </div>
//                   <Icon
//                     name="right"
//                     size={28}
//                     className={styles.groupItem__arrow}
//                   />
//                 </div>
//               ))}
//             </div>
//           </div>
//         </aside>
//         {/* Sidebar section end */}

//         {/* Main content section start */}
//         <section
//           className={`${styles.mainContent} ${!selectedGroup ? styles.mainContent_hidden : ""}`}
//         >
//           {selectedGroup && (
//             <>
//               {/* Group header start */}
//               <div className={styles.groupHeader}>
//                 <div className={styles.groupHeader__topRow}>
//                   <button
//                     className={styles.backBtn}
//                     onClick={() =>
//                       dispatch(groupActions.setSelectedGroup(null))
//                     }
//                     aria-label="Back to groups"
//                   >
//                     <Icon name="back" size={24} />
//                   </button>

//                   <h1 className={styles.groupHeader__titleMobile}>
//                     {selectedGroup.name}
//                   </h1>

//                   <button
//                     className={styles.settingsBtnMobile}
//                     onClick={() => setIsSettingsOpen(true)}
//                   >
//                     <Icon name="settings" size={24} />
//                   </button>
//                 </div>

//                 <div className={styles.groupHeader__desktopRow}>
//                   <h1 className={styles.groupHeader__titleDesktop}>
//                     {selectedGroup.name}
//                   </h1>
//                   <div className={styles.groupHeader__actionsDesktop}>
//                     <button className={styles.inviteBtn} onClick={handleInvite}>
//                       <Icon name="invite" size={32} />
//                       <span>Invite</span>
//                     </button>
//                     <button
//                       className={styles.settingsBtn}
//                       onClick={() => setIsSettingsOpen(true)}
//                     >
//                       <Icon name="settings" size={32} />
//                     </button>
//                   </div>
//                 </div>

//                 <div className={styles.groupHeader__info}>
//                   <div className={styles.groupHeader__infoGroup}>
//                     <div className={styles.groupHeader__meta}>
//                       <span>{selectedGroup.members.length} members</span>
//                       <span>•</span>
//                       <span>{selectedGroup.places.length} places</span>
//                     </div>

//                     <div className={styles.groupHeader__avatars}>
//                       {selectedGroup.members.slice(0, 3).map((member: GroupMember) => (
//                         <img
//                           key={member.id}
//                           src={
//                             member.avatar ||
//                             "https://images.unsplash.com/photo-1534528741775-53994a69daeb"
//                           }
//                           alt={member.name}
//                           className={styles.groupHeader__avatar}
//                         />
//                       ))}
//                       {selectedGroup.members.length > 3 && (
//                         <div className={styles.groupHeader__avatarMore}>
//                           +{selectedGroup.members.length - 3}
//                         </div>
//                       )}
//                     </div>
//                   </div>

//                   <div className={styles.groupHeader__actionsMobile}>
//                     <button className={styles.inviteBtn} onClick={handleInvite}>
//                       <Icon name="invite" size={32} />
//                       <span>Invite</span>
//                     </button>
//                   </div>
//                 </div>
//               </div>
//               {/* Group header end */}

//               {/* Tabs section start */}
//               <div className={styles.tabs}>
//                 <button
//                   className={`${styles.tab} ${activeTab === "places" ? styles.tab_active : ""}`}
//                   onClick={() => setActiveTab("places")}
//                 >
//                   Group places
//                 </button>
//                 <button
//                   className={`${styles.tab} ${activeTab === "members" ? styles.tab_active : ""}`}
//                   onClick={() => setActiveTab("members")}
//                 >
//                   Members
//                 </button>
//               </div>
//               {/* Tabs section end */}

//               {activeTab === "places" ? (
//                 <div className={styles.placesGrid}>
//                   {selectedGroup.places.length === 0 ? (
//                     <p className={styles.emptyText}>
//                       No places in this group yet.
//                     </p>
//                   ) : (
//                     selectedGroup.places.map((place: Place) => (
//                       <div key={place.id} className={styles.placeCardWrapper}>
//                         <PlaceCard
//                           image={
//                             place.photo ||
//                             "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&w=600&q=80"
//                           }
//                           title={place.name}
//                           category={place.category}
//                           workingHours="08:00 - 20:00"
//                           addedBy={`Added by ${currentUser?.name || "Member"}`}
//                           deleteButtonText="Remove from group"
//                           onEdit={() => handleCardEdit(place)}
//                           onShare={() => handleOpenShare(place)}
//                           onDelete={() =>
//                             handleDeleteGroupPlace(selectedGroup.id, place.id)
//                           }
//                         />
//                       </div>
//                     ))
//                   )}
//                 </div>
//               ) : (
//                 <div className={styles.membersContainer}>
//                   <div className={styles.searchWrapper}>
//                     <input
//                       type="text"
//                       placeholder="Search members"
//                       value={memberSearchQuery}
//                       onChange={(e) => setMemberSearchQuery(e.target.value)}
//                       className={styles.searchInput}
//                     />
//                     <Icon
//                       name="search"
//                       size={32}
//                       className={styles.searchIcon}
//                     />
//                   </div>

//                   <div className={styles.membersList}>
//                     {filteredMembers.length === 0 ? (
//                       <p className={styles.emptyText}>No members found.</p>
//                     ) : (
//                       filteredMembers.map((member: GroupMember) => {
//                         const isMe = member.id === currentUser?.id;
//                         const isMenuOpen = openMenuMemberId === member.id;

//                         return (
//                           <div key={member.id} className={styles.memberItem}>
//                             <div className={styles.memberItem__left}>
//                               <img
//                                 src={
//                                   member.avatar ||
//                                   "https://images.unsplash.com/photo-1534528741775-53994a69daeb"
//                                 }
//                                 alt={member.name}
//                                 className={styles.memberItem__avatar}
//                               />
//                               <div className={styles.memberItem__info}>
//                                 <span className={styles.memberItem__name}>
//                                   {member.name}
//                                 </span>
//                                 <span className={styles.memberItem__role}>
//                                   {member.isAdmin ? "Admin" : "Member"}
//                                 </span>
//                               </div>
//                             </div>

//                             <div
//                               className={styles.memberItem__right}
//                               ref={isMenuOpen ? menuRef : null}
//                             >
//                               {isMe ? (
//                                 <span className={styles.memberItem__youBadge}>
//                                   You
//                                 </span>
//                               ) : (
//                                 <div className={styles.memberActionWrapper}>
//                                   <button
//                                     type="button"
//                                     className={styles.memberItem__menuBtn}
//                                     onClick={() =>
//                                       setOpenMenuMemberId(
//                                         isMenuOpen ? null : member.id,
//                                       )
//                                     }
//                                     aria-label="Member options"
//                                   >
//                                     <Icon name="menu" size={40} />
//                                   </button>

//                                   {isMenuOpen && (
//                                     <div className={styles.memberDropdown}>
//                                       <button
//                                         type="button"
//                                         className={styles.memberDropdownItem}
//                                         onClick={() =>
//                                           handleMakeAdmin(member.id)
//                                         }
//                                       >
//                                         Make admin
//                                       </button>
//                                       <button
//                                         type="button"
//                                         className={
//                                           styles.memberDropdownItemDanger
//                                         }
//                                         onClick={() =>
//                                           handleRemoveMember(
//                                             member.id as string,
//                                             member.name,
//                                           )
//                                         }
//                                       >
//                                         Remove from group
//                                       </button>
//                                     </div>
//                                   )}
//                                 </div>
//                               )}
//                             </div>
//                           </div>
//                         );
//                       })
//                     )}
//                   </div>
//                 </div>
//               )}
//             </>
//           )}
//         </section>
//         {/* Main content section end */}
//       </div>

//       <ShareToGroup
//         isOpen={isShareModalOpen}
//         onClose={handleCloseShare}
//         groups={groups}
//         onSelectGroup={handleConfirmShare}
//       />

//       {selectedGroup && (
//         <GroupSettingsModal
//           key={selectedGroup.id}
//           isOpen={isSettingsOpen}
//           group={selectedGroup}
//           currentUserId={currentUser?.id || 0}
//           onClose={() => setIsSettingsOpen(false)}
//           onSave={handleSaveSettings}
//           onLeave={handleLeaveGroup}
//           onDelete={handleDeleteGroup}
//         />
//       )}

//       {/* Модальне вікно підтвердження видалення учасника */}
//       {memberToRemove && (
//         <div className={styles.overlay} onClick={() => setMemberToRemove(null)}>
//           <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
//             <div className={styles.modal__header}>
//               <h3 className={styles.modal__title}>Remove member</h3>
//               <button
//                 className={styles.modal__closeBtn}
//                 onClick={() => setMemberToRemove(null)}
//                 type="button"
//                 aria-label="Close modal"
//               >
//                 <Icon name="close" size={24} />
//               </button>
//             </div>

//             <div className={styles.modal__confirmContainer}>
//               <div className={styles.modal__confirmTextWrapper}>
//                 <p className={styles.modal__confirmText}>
//                   Are you sure you want to remove{" "}
//                   <strong>{memberToRemove.name}</strong> from this group?
//                 </p>
//               </div>

//               <div className={styles.modal__confirmActions}>
//                 <button
//                   type="button"
//                   className={styles.modal__cancelBtn}
//                   onClick={() => setMemberToRemove(null)}
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="button"
//                   className={styles.modal__deleteBtn}
//                   onClick={handleConfirmRemoveMember}
//                 >
//                   Remove
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       <CreateGroup
//         isOpen={isCreateModalOpen}
//         onClose={() => setIsCreateModalOpen(false)}
//         onCreate={handleCreateGroup}
//       />
//     </main>
//   );
// };

// export default Groups;
