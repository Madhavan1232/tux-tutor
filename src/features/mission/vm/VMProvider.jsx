import React, { createContext, useState, useEffect, useRef, useCallback } from 'react';
import { loadCheerpX } from './cheerpxLoader';
import { checkCrossOriginIsolation } from './isolationCheck';

const VMContext = createContext(null);

// Promise queue to ensure sequential execution of silent commands
class AsyncQueue {
  constructor() {
    this.queue = Promise.resolve();
  }
  enqueue(task) {
    const result = this.queue.then(() => task());
    this.queue = result.catch(() => {});
    return result;
  }
}

export function VMProvider({ children }) {
  const [isReady, setIsReady] = useState(false);
  const [isBooting, setIsBooting] = useState(false);
  const [bootProgress, setBootProgress] = useState('Standby');
  const [bootError, setBootError] = useState(null);

  const cxRef = useRef(null);
  const cxReadFuncRef = useRef(null);
  const activeTerminalRef = useRef(null);
  const silentCollectorRef = useRef(null);
  const execQueueRef = useRef(new AsyncQueue());
  const isAliveRef = useRef(true);
  const textDecoderRef = useRef(new TextDecoder('utf-8'));
  const textEncoderRef = useRef(new TextEncoder());

  // Cross origin isolation check
  const isolation = checkCrossOriginIsolation();

  const bootVM = useCallback(async () => {
    if (cxRef.current) {
      return; // Already initialized
    }

    if (!isolation.isIsolated) {
      setBootError(isolation.error);
      return;
    }

    setIsBooting(true);
    setBootError(null);
    setBootProgress('Verifying security environment...');

    try {
      setBootProgress('Loading CheerpX runtime from official CDN...');
      const CheerpX = await loadCheerpX();

      setBootProgress('Mounting virtual filesystems & storage...');
      const diskUrl =
        import.meta.env.VITE_CHEERPX_DISK_URL ||
        'wss://disks.webvm.io/debian_buster_large_permis_fixed_01-06-2026.ext2';

      let blockDevice;
      const isWss = diskUrl.startsWith('wss://') || diskUrl.startsWith('ws://');

      if (isWss && CheerpX.CloudDevice) {
        try {
          blockDevice = await CheerpX.CloudDevice.create(diskUrl);
        } catch (wsErr) {
          console.warn('[CheerpX] CloudDevice wss failed, attempting HTTP fallback:', wsErr);
          const httpUrl = 'https:' + diskUrl.replace(/^wss?:\/\//, '//');
          blockDevice = await (CheerpX.HttpBytesDevice || CheerpX.CloudDevice).create(httpUrl);
        }
      } else if (CheerpX.HttpBytesDevice) {
        blockDevice = await CheerpX.HttpBytesDevice.create(diskUrl);
      } else if (CheerpX.CloudDevice) {
        blockDevice = await CheerpX.CloudDevice.create(diskUrl);
      } else {
        throw new Error('No compatible CheerpX block device provider found.');
      }

      // IndexedDB persistence overlay
      const idbDevice = await CheerpX.IDBDevice.create('tux_learner_overlay_v1');
      const overlayDevice = await CheerpX.OverlayDevice.create(blockDevice, idbDevice);
      const dataDevice = await CheerpX.DataDevice.create();

      const mountPoints = [
        { type: 'ext2', dev: overlayDevice, path: '/' },
        { type: 'dir', dev: dataDevice, path: '/data' },
        { type: 'devs', path: '/dev' },
        { type: 'devpts', path: '/dev/pts' },
        { type: 'proc', path: '/proc' },
        { type: 'sys', path: '/sys' },
      ];

      setBootProgress('Initializing Linux machine...');
      const cx = await CheerpX.Linux.create({
        mounts: mountPoints,
      });

      cxRef.current = cx;

      // Setup custom console output router
      const initialCols = 80;
      const initialRows = 24;

      const sendInput = cx.setCustomConsole(
        (buf) => {
          if (silentCollectorRef.current) {
            silentCollectorRef.current(buf);
          } else if (activeTerminalRef.current) {
            activeTerminalRef.current.write(new Uint8Array(buf));
          }
        },
        initialCols,
        initialRows
      );

      cxReadFuncRef.current = sendInput;

      setBootProgress('Machine online. Preparing interactive shell...');
      setIsReady(true);
      setIsBooting(false);

      // Standardize environment on user@tux with /home/user and ~/.bashrc prompt
      try {
        const prepCmd = [
          'mkdir -p /home/user',
          'echo "tux" > /etc/hostname 2>/dev/null || true',
          'touch /home/user/.bashrc',
          'echo "export HOSTNAME=tux" >> /home/user/.bashrc',
          'echo "export USER=user" >> /home/user/.bashrc',
          'echo "export LOGNAME=user" >> /home/user/.bashrc',
          'echo \'export PS1="user@tux:\\w\\$ "\' >> /home/user/.bashrc',
          'if [ ! -e /home/learner ]; then ln -s /home/user /home/learner 2>/dev/null || true; fi',
        ].join(' && ');

        await cx.run('/bin/bash', ['-c', prepCmd], {
          env: [
            'HOME=/home/user',
            'USER=user',
            'LOGNAME=user',
            'HOSTNAME=tux',
            'PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin',
          ],
          cwd: '/home/user',
          uid: 1000,
          gid: 1000,
        });
      } catch (prepErr) {
        console.warn('[CheerpX] Prep script warning:', prepErr);
      }

      // Start the interactive shell loop in the background
      (async () => {
        while (isAliveRef.current) {
          try {
            await cx.run('/bin/bash', ['--login'], {
              env: [
                'HOME=/home/user',
                'TERM=xterm-256color',
                'USER=user',
                'LOGNAME=user',
                'HOSTNAME=tux',
                'SHELL=/bin/bash',
                'PS1=\\[\\e[38;2;188;179;179m\\]user@tux\\[\\e[0m\\]:\\[\\e[38;2;255;255;255m\\]\\w\\[\\e[0m\\]\\$ ',
                'LANG=en_US.UTF-8',
                'LC_ALL=C',
                'PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin',
              ],
              cwd: '/home/user',
              uid: 1000,
              gid: 1000,
            });
          } catch (shellErr) {
            console.warn('[CheerpX] Shell exited or crashed:', shellErr);
            // Brief pause before restarting shell
            await new Promise((r) => setTimeout(r, 1000));
          }
        }
      })();
    } catch (err) {
      console.error('[CheerpX] Boot failed:', err);
      setBootError({
        title: 'Virtual Machine Boot Failed',
        message: err.message || 'An error occurred while booting CheerpX.',
        hint: 'Check network connectivity to cxrtnc.leaningtech.com and disks.webvm.io, and ensure Cross-Origin Isolation headers are active.',
      });
      setIsBooting(false);
      setIsReady(false);
    }
  }, [isolation.isIsolated, isolation.error]);

  // Terminal attachment & detachment
  const attachTerminal = useCallback((term) => {
    activeTerminalRef.current = term;

    const disposable = term.onData((data) => {
      if (cxReadFuncRef.current) {
        const encoded = textEncoderRef.current.encode(data);
        for (let i = 0; i < encoded.length; i++) {
          cxReadFuncRef.current(encoded[i]);
        }
      }
    });

    return () => {
      disposable.dispose();
      if (activeTerminalRef.current === term) {
        activeTerminalRef.current = null;
      }
    };
  }, []);

  // Silent command execution
  const runCommand = useCallback((cmd, options = {}) => {
    if (!cxRef.current) {
      return Promise.reject(new Error('VM not running'));
    }

    return execQueueRef.current.enqueue(async () => {
      const outputChunks = [];
      const prevCollector = silentCollectorRef.current;

      silentCollectorRef.current = (chunk) => {
        outputChunks.push(textDecoderRef.current.decode(chunk, { stream: true }));
      };

      try {
        const res = await cxRef.current.run('/bin/bash', ['-c', cmd], {
          env: [
            'HOME=/home/user',
            'TERM=xterm-256color',
            'USER=user',
            'LOGNAME=user',
            'HOSTNAME=tux',
            'SHELL=/bin/bash',
            'PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin',
          ],
          cwd: options.cwd || '/home/user',
          uid: 1000,
          gid: 1000,
        });

        return {
          stdout: outputChunks.join('').trim(),
          exitCode: typeof res?.status === 'number' ? res.status : 0,
        };
      } finally {
        silentCollectorRef.current = prevCollector;
      }
    });
  }, []);

  // Write file to filesystem using base64 decoding inside bash
  const writeFile = useCallback(
    async (path, content) => {
      const b64 =
        typeof window !== 'undefined'
          ? btoa(unescape(encodeURIComponent(content)))
          : Buffer.from(content).toString('base64');

      const cmd = `mkdir -p "$(dirname "${path}")" && echo "${b64}" | base64 -d > "${path}"`;
      const res = await runCommand(cmd);
      if (res.exitCode !== 0) {
        throw new Error(`Failed to write file ${path}: ${res.stdout}`);
      }
      return true;
    },
    [runCommand]
  );

  // Read file from filesystem
  const readFile = useCallback(
    async (path) => {
      const res = await runCommand(`cat "${path}"`);
      if (res.exitCode !== 0) {
        throw new Error(`Failed to read file ${path}: ${res.stdout}`);
      }
      return res.stdout;
    },
    [runCommand]
  );

  // Directory listing
  const listDir = useCallback(
    async (dirPath = '/home/user') => {
      // Find files and directories with sizes and types
      const cmd = `find "${dirPath}" -maxdepth 1 -mindepth 1 -printf "%y|%s|%f\\n" 2>/dev/null || ls -1 "${dirPath}"`;
      const res = await runCommand(cmd);

      if (res.exitCode !== 0 && !res.stdout) {
        return [];
      }

      const entries = [];
      const lines = res.stdout.split('\n').filter(Boolean);

      for (const line of lines) {
        if (line.includes('|')) {
          const [type, size, name] = line.split('|');
          entries.push({
            name,
            path: `${dirPath.replace(/\/$/, '')}/${name}`,
            isDir: type === 'd',
            size: parseInt(size, 10) || 0,
          });
        } else {
          entries.push({
            name: line.trim(),
            path: `${dirPath.replace(/\/$/, '')}/${line.trim()}`,
            isDir: false,
            size: 0,
          });
        }
      }

      // Sort: directories first, then alphabetical
      return entries.sort((a, b) => {
        if (a.isDir && !b.isDir) return -1;
        if (!a.isDir && b.isDir) return 1;
        return a.name.localeCompare(b.name);
      });
    },
    [runCommand]
  );

  // Reset overlay: clears user files and resets home directory
  const resetVM = useCallback(async () => {
    if (!cxRef.current) return;
    try {
      await runCommand(
        'rm -rf /home/user/* /home/user/.* 2>/dev/null; mkdir -p /home/user/uploads && touch /home/user/.bash_history'
      );
      return true;
    } catch (err) {
      console.error('[CheerpX] Reset failed:', err);
      throw err;
    }
  }, [runCommand]);

  useEffect(() => {
    isAliveRef.current = true;
    return () => {
      isAliveRef.current = false;
    };
  }, []);

  const value = {
    ready: isReady,
    booting: isBooting,
    bootProgress,
    error: bootError,
    isolation,
    bootVM,
    attachTerminal,
    runCommand,
    writeFile,
    readFile,
    listDir,
    resetVM,
  };

  return <VMContext.Provider value={value}>{children}</VMContext.Provider>;
}

export { VMContext };
