import React, { useState } from "react";
import styles from "./CreateGroup.module.scss";
import Icon from "@/modules/shared/Icon";

interface CreateGroupProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, description: string) => void;
}

const CreateGroup: React.FC<CreateGroupProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate(name, description);
    setName("");
    setDescription("");
    onClose();
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>Create group</h2>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close modal"
          >
            <Icon name="close" size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>
              Group name <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              className={styles.input}
              placeholder="e.g. Family"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Description</label>
            <textarea
              className={styles.textarea}
              placeholder="Tell people what makes this place special"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className={`${styles.createBtn} ${
              !name.trim() ? styles.createBtn_disabled : ""
            }`}
            disabled={!name.trim()}
          >
            Create
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateGroup;