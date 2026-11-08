import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, HardDrive } from 'lucide-react';
import FileTree from './FileTree';
import FilePreview from './FilePreview';
import styles from './FilesTab.module.css';

/**
 * FilesTab — Live filesystem viewer for the learner's home directory.
 */
export default function FilesTab({ vm }) {
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const currentPath = '/home/user';

  const fetchFiles = useCallback(async () => {
    if (!vm || !vm.ready) return;
    setIsLoading(true);
    try {
      const list = await vm.listDir(currentPath);
      setEntries(list);
    } catch (err) {
      console.error('[FilesTab] Failed to list directory:', err);
    } finally {
      setIsLoading(false);
    }
  }, [vm, currentPath]);

  // Fetch when VM becomes ready or path changes
  useEffect(() => {
    if (vm?.ready) {
      fetchFiles();
    }
  }, [vm?.ready, fetchFiles]);

  const handleSelectFile = async (file) => {
    setSelectedFile(file);
    try {
      const content = await vm.readFile(file.path);
      setFileContent(content);
    } catch (err) {
      console.error('[FilesTab] Failed to read file:', err);
      setFileContent('(Error reading file content)');
    }
  };

  const handleClosePreview = () => {
    setSelectedFile(null);
    setFileContent('');
  };

  return (
    <div className={styles.filesTab} role="region" aria-label="Filesystem explorer">
      <div className={styles.header}>
        <div className={styles.pathBadge}>
          <HardDrive size={13} className={styles.pathIcon} />
          <span className={styles.pathText}>
            {currentPath.replace('/home/user', '~')}
          </span>
        </div>

        <button
          type="button"
          className={styles.refreshBtn}
          onClick={fetchFiles}
          disabled={isLoading || !vm?.ready}
          title="Refresh filesystem tree"
          aria-label="Refresh files"
        >
          <RefreshCw
            size={13}
            className={`${styles.refreshIcon} ${isLoading ? styles.spinning : ''}`}
          />
          <span>Refresh</span>
        </button>
      </div>

      <div className={styles.treeSection}>
        {isLoading && entries.length === 0 ? (
          <div className={styles.loadingState}>
            <span>Reading filesystem...</span>
          </div>
        ) : (
          <FileTree
            entries={entries}
            selectedFile={selectedFile}
            onSelectFile={handleSelectFile}
            currentPath={currentPath}
          />
        )}
      </div>

      {selectedFile && (
        <FilePreview
          file={selectedFile}
          content={fileContent}
          onClose={handleClosePreview}
        />
      )}
    </div>
  );
}
