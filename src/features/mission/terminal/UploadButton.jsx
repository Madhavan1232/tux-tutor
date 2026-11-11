// Icons: lucide-react only — do not mix libraries
import React, { useRef, useState } from 'react';
import { Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import styles from './UploadButton.module.css';

/**
 * UploadButton — Browser File API uploader with strict validation.
 */
export default function UploadButton({ vm, mission, onUploadComplete }) {
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const maxSizeMB = mission?.uploadConfig?.maxSizeMB || 2;
  const allowedExtensions = mission?.uploadConfig?.allowedExtensions || [
    '.txt',
    '.log',
    '.csv',
    '.sh',
    '.json',
  ];

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input so re-selecting same file triggers change
    e.target.value = '';

    // 1. Size safeguard
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      setFeedback({
        type: 'error',
        message: `File exceeds maximum allowed size of ${maxSizeMB} MB.`,
      });
      setTimeout(() => setFeedback(null), 4000);
      return;
    }

    // 2. Extension safeguard
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (allowedExtensions.length > 0 && !allowedExtensions.includes(ext)) {
      setFeedback({
        type: 'error',
        message: `Invalid file extension. Allowed: ${allowedExtensions.join(', ')}`,
      });
      setTimeout(() => setFeedback(null), 4000);
      return;
    }

    // 3. Filename sanitization (no path traversal, only safe chars)
    const rawName = file.name.replace(/[/\\?%*:|"<>]/g, '_');
    const sanitizedName = rawName.replace(/^\.+/, 'file_');

    setIsUploading(true);
    setFeedback({ type: 'info', message: `Uploading ${sanitizedName}...` });

    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8 = new Uint8Array(arrayBuffer);
      let binaryStr = '';
      for (let i = 0; i < uint8.byteLength; i++) {
        binaryStr += String.fromCharCode(uint8[i]);
      }
      const b64 = btoa(binaryStr);

      const targetPath = `/home/user/uploads/${sanitizedName}`;
      await vm.runCommand(`mkdir -p /home/user/uploads && echo "${b64}" | base64 -d > "${targetPath}"`);

      setFeedback({
        type: 'success',
        message: `Saved to ~/uploads/${sanitizedName}`,
      });
      if (onUploadComplete) onUploadComplete(sanitizedName);
      setTimeout(() => setFeedback(null), 3500);
    } catch (err) {
      console.error('[Upload] Error saving file to VM:', err);
      setFeedback({
        type: 'error',
        message: 'Failed to upload file into Linux VM.',
      });
      setTimeout(() => setFeedback(null), 4000);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <input
        ref={fileInputRef}
        type="file"
        className={styles.hiddenInput}
        onChange={handleFileChange}
        accept={allowedExtensions.join(',')}
        aria-label="Upload file to terminal"
      />

      <button
        type="button"
        className={styles.uploadBtn}
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        title="Upload file into ~/uploads"
      >
        <Upload size={14} className={styles.btnIcon} />
        <span>{isUploading ? 'Uploading...' : 'Upload'}</span>
      </button>

      {feedback && (
        <div className={`${styles.feedbackBanner} ${styles[feedback.type]}`}>
          {feedback.type === 'success' ? (
            <CheckCircle2 size={13} />
          ) : (
            <AlertCircle size={13} />
          )}
          <span>{feedback.message}</span>
        </div>
      )}
    </div>
  );
}
