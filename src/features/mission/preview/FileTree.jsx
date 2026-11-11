// Icons: lucide-react only — do not mix libraries
import React from 'react';
import { Folder, File } from 'lucide-react';
import styles from './FileTree.module.css';

/**
 * FileTree — Recursive or flat directory tree component for the VM filesystem.
 */
export default function FileTree({
  entries = [],
  selectedFile,
  onSelectFile,
  onOpenDirectory,
}) {
  if (!entries.length) {
    return (
      <div className={styles.emptyTree}>
        <span>Directory is empty</span>
      </div>
    );
  }

  return (
    <ul className={styles.treeList} role="tree" aria-label="Linux Filesystem Tree">
      {entries.map((item) => {
        const isSelected = selectedFile?.path === item.path;
        return (
          <li
            key={item.path}
            className={`${styles.treeItem} ${isSelected ? styles.selected : ''}`}
            role="treeitem"
            aria-selected={isSelected}
            onClick={() => {
              if (item.isDir && onOpenDirectory) {
                onOpenDirectory(item.path);
              } else if (!item.isDir && onSelectFile) {
                onSelectFile(item);
              }
            }}
          >
            <span className={styles.itemIcon}>
              {item.isDir ? (
                <Folder size={15} className={styles.folderIcon} />
              ) : (
                <File size={15} className={styles.fileIcon} />
              )}
            </span>
            <span className={styles.itemName}>{item.name}</span>
            {!item.isDir && item.size !== undefined && (
              <span className={styles.itemSize}>{item.size} B</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
