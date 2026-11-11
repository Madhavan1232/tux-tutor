// Icons: lucide-react only — do not mix libraries
import React from 'react';
import { FileText, X } from 'lucide-react';
import styles from './FilePreview.module.css';

/**
 * FilePreview — Monospace viewer for files in the VM with line numbers.
 */
export default function FilePreview({ file, content, onClose }) {
  if (!file) return null;

  // Check if content looks binary (contains null bytes)
  const isBinary = content && Array.from(content.slice(0, 512)).some((c) => c.charCodeAt(0) === 0);
  const lines = isBinary ? [] : (content || '').split('\n');

  return (
    <div className={styles.previewContainer} role="region" aria-label={`Preview of ${file.name}`}>
      <div className={styles.previewHeader}>
        <div className={styles.fileMeta}>
          <FileText size={14} className={styles.fileIcon} />
          <span className={styles.fileName}>{file.name}</span>
          <span className={styles.fileSize}>({file.size} bytes)</span>
        </div>
        <button
          type="button"
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Close file preview"
        >
          <X size={14} />
        </button>
      </div>

      <div className={styles.contentArea}>
        {isBinary ? (
          <div className={styles.binaryNotice}>
            <p>Binary or non-UTF8 file cannot be rendered in text preview.</p>
          </div>
        ) : lines.length === 0 || (lines.length === 1 && lines[0] === '') ? (
          <div className={styles.emptyNotice}>
            <span>(Empty file)</span>
          </div>
        ) : (
          <pre className={styles.codeBlock}>
            <code>
              {lines.map((line, idx) => (
                <div key={idx} className={styles.codeLine}>
                  <span className={styles.lineNum}>{idx + 1}</span>
                  <span className={styles.lineContent}>{line}</span>
                </div>
              ))}
            </code>
          </pre>
        )}
      </div>
    </div>
  );
}
