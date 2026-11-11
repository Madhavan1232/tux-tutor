import React, { createContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { loadCheerpX } from './cheerpxLoader';
import { checkCrossOriginIsolation } from './isolationCheck';

const VMContext = createContext(null);

const OVERLAY_STORAGE_KEY = 'tux_learner_overlay_v2';
const LEGACY_OVERLAY_STORAGE_KEYS = ['tux_learner_overlay_v1'];
const DEFAULT_DISK_URL =
  'wss://disks.webvm.io/debian_buster_large_permis_fixed_01-06-2026.ext2';
const FATAL_LIB_ERROR_RE = /invalid ELF header|error while loading shared libraries/i;
const MAX_PENDING_TERMINAL_BYTES = 65536;
const SHELL_CRASH_WINDOW_MS = 1500;
const MAX_RAPID_SHELL_CRASHES = 3;

const BASE_ENV = [
  'HOME=/home/user',
  'USER=user',
  'LOGNAME=user',
  'HOSTNAME=tux',
  'SHELL=/bin/bash',
  'PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin',
];

const INTERACTIVE_SHELL_ENV = [
  ...BASE_ENV,
  'TERM=xterm-256color',
  'PS1=\\[\\e[38;2;188;179;179m\\]user@tux\\[\\e[0m\\]:\\[\\e[38;2;255;255;255m\\]\\w\\[\\e[0m\\]\\$ ',
  'LANG=en_US.UTF-8',
  'LC_ALL=C',
];

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

/**
 * Deletes legacy IndexedDB overlay databases without blocking VM startup if another tab holds a lock.
 */
function cleanupLegacyOverlayDatabases() {
  if (typeof window === 'undefined' || !window.indexedDB?.deleteDatabase) {
    return;
  }
  for (const legacyKey of LEGACY_OVERLAY_STORAGE_KEYS) {
    try {
      const req = window.indexedDB.deleteDatabase(legacyKey);
      req.onerror = () => {};
      req.onblocked = () => {};
    } catch {
      // Ignore IndexedDB cleanup failures in restricted browser contexts
    }
  }
}

/**
 * Opens the remote read-only ext2 disk image using CloudDevice (wss) with HttpBytesDevice fallback.
 */
async function createReadBlockDevice(CheerpX, diskUrl) {
  const isWss = diskUrl.startsWith('wss://') || diskUrl.startsWith('ws://');

  if (isWss && CheerpX.CloudDevice) {
    try {
      return await CheerpX.CloudDevice.create(diskUrl);
    } catch (wsErr) {
      console.warn('[CheerpX] CloudDevice wss failed, attempting HTTP fallback:', wsErr);
      const httpUrl = 'https:' + diskUrl.replace(/^wss?:\/\//, '//');
      return (CheerpX.HttpBytesDevice || CheerpX.CloudDevice).create(httpUrl);
    }
  }

  if (CheerpX.HttpBytesDevice) {
    return CheerpX.HttpBytesDevice.create(diskUrl);
  }
  if (CheerpX.CloudDevice) {
    return CheerpX.CloudDevice.create(diskUrl);
  }
  throw new Error('No compatible CheerpX block device provider found.');
}

/**
 * Mounts an ext2 overlay and Linux runtime on top of an opened block device and IDB overlay.
 */
async function createLinuxRuntime(CheerpX, blockDevice, idbDevice) {
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

  return CheerpX.Linux.create({ mounts: mountPoints });
}

/**
 * Runs a single command with an isolated console collector before attaching the interactive terminal.
 */
async function runBufferedLinuxCommand(cx, args, options) {
  const decoder = new TextDecoder('utf-8');
  const chunks = [];
  const sendInput = cx.setCustomConsole(
    (buf) => {
      chunks.push(decoder.decode(new Uint8Array(buf), { stream: true }));
    },
    80,
    24
  );

  const res = await cx.run('/bin/bash', args, options);
  const tail = decoder.decode();
  if (tail) {
    chunks.push(tail);
  }

  return {
    exitCode: typeof res?.status === 'number' ? res.status : 0,
    output: chunks.join('').trim(),
    sendInput,
  };
}

/**
 * Verifies `/bin/bash` and core shared libraries load properly on the mounted overlay.
 * Automatically resets the IDB overlay and re-mounts once if corrupted ELF/library state is detected.
 */
async function mountAndVerifyLinuxVM(CheerpX, blockDevice, { forceResetOverlay = false, onProgress }) {
  const idbDevice = await CheerpX.IDBDevice.create(OVERLAY_STORAGE_KEY);
  if (forceResetOverlay) {
    await idbDevice.reset();
  }

  const probeOptions = {
    env: BASE_ENV,
    cwd: '/',
    uid: 1000,
    gid: 1000,
  };

  let cx = await createLinuxRuntime(CheerpX, blockDevice, idbDevice);
  let probe = await runBufferedLinuxCommand(cx, ['-c', 'echo __TUX_VM_OK__'], probeOptions);

  const isHealthy = (result) =>
    result.exitCode === 0 &&
    result.output.includes('__TUX_VM_OK__') &&
    !FATAL_LIB_ERROR_RE.test(result.output);

  if (!isHealthy(probe)) {
    if (!forceResetOverlay) {
      onProgress?.('Detected corrupted filesystem cache. Rebuilding Linux overlay...');
      console.warn('[CheerpX] Linux overlay health check failed; resetting IDB cache:', {
        exitCode: probe.exitCode,
        output: probe.output.slice(0, 300),
      });
      await idbDevice.reset();
      cx = await createLinuxRuntime(CheerpX, blockDevice, idbDevice);
      probe = await runBufferedLinuxCommand(cx, ['-c', 'echo __TUX_VM_OK__'], probeOptions);
    }

    if (!isHealthy(probe)) {
      const detail = probe.output || `exit code ${probe.exitCode}`;
      throw new Error(`Linux root filesystem verification failed: ${detail}`);
    }
  }

  // Standardize environment while keeping initial setup out of xterm output
  const prepCmd = [
    'mkdir -p /home/user',
    'echo "tux" > /etc/hostname 2>/dev/null || true',
    'touch /home/user/.bashrc',
    'grep -q "HOSTNAME=tux" /home/user/.bashrc || echo "export HOSTNAME=tux" >> /home/user/.bashrc',
    'grep -q "USER=user" /home/user/.bashrc || echo "export USER=user" >> /home/user/.bashrc',
    'grep -q "LOGNAME=user" /home/user/.bashrc || echo "export LOGNAME=user" >> /home/user/.bashrc',
    'grep -q "PS1=" /home/user/.bashrc || echo \'export PS1="user@tux:\\w\\$ "\' >> /home/user/.bashrc',
    'if [ ! -e /home/learner ]; then ln -s /home/user /home/learner 2>/dev/null || true; fi',
  ].join(' && ');

  try {
    const prepResult = await runBufferedLinuxCommand(cx, ['-c', prepCmd], {
      env: BASE_ENV,
      cwd: '/home/user',
      uid: 1000,
      gid: 1000,
    });
    if (FATAL_LIB_ERROR_RE.test(prepResult.output)) {
      throw new Error(`Environment initialization hit library corruption: ${prepResult.output}`);
    }
  } catch (prepErr) {
    if (FATAL_LIB_ERROR_RE.test(prepErr?.message || '')) {
      throw prepErr;
    }
    console.warn('[CheerpX] Prep script warning:', prepErr);
  }

  return { cx, idbDevice };
}

export function VMProvider({ children }) {
  const [isReady, setIsReady] = useState(false);
  const [isBooting, setIsBooting] = useState(false);
  const [bootProgress, setBootProgress] = useState('Standby');
  const [bootError, setBootError] = useState(null);

  const cxRef = useRef(null);
  const idbDeviceRef = useRef(null);
  const cxReadFuncRef = useRef(null);
  const activeTerminalRef = useRef(null);
  const pendingTerminalChunksRef = useRef([]);
  const pendingTerminalBytesRef = useRef(0);
  const silentCollectorRef = useRef(null);
  const execQueueRef = useRef(new AsyncQueue());
  const bootPromiseRef = useRef(null);
  const shouldResetOnNextBootRef = useRef(false);
  const shellSessionIdRef = useRef(0);
  const isAliveRef = useRef(true);
  const textDecoderRef = useRef(new TextDecoder('utf-8'));
  const textEncoderRef = useRef(new TextEncoder());

  // Cross origin isolation check
  const isolation = checkCrossOriginIsolation();

  const startInteractiveShellLoop = useCallback((cx, sessionId) => {
    (async () => {
      let rapidCrashCount = 0;

      while (isAliveRef.current && shellSessionIdRef.current === sessionId) {
        const startedAt = Date.now();
        try {
          const shellResult = await cx.run('/bin/bash', ['--login'], {
            env: INTERACTIVE_SHELL_ENV,
            cwd: '/home/user',
            uid: 1000,
            gid: 1000,
          });

          if (!isAliveRef.current || shellSessionIdRef.current !== sessionId) {
            break;
          }

          const elapsedMs = Date.now() - startedAt;
          const exitStatus = typeof shellResult?.status === 'number' ? shellResult.status : 0;

          if (exitStatus !== 0 && elapsedMs < SHELL_CRASH_WINDOW_MS) {
            rapidCrashCount += 1;
            if (rapidCrashCount >= MAX_RAPID_SHELL_CRASHES) {
              shouldResetOnNextBootRef.current = true;
              cxRef.current = null;
              cxReadFuncRef.current = null;
              setIsReady(false);
              setBootError({
                title: 'Terminal Shell Crashed Repeatedly',
                message: `The Linux shell (/bin/bash) exited immediately with status ${exitStatus}. Your local filesystem overlay may be corrupted.`,
                hint: 'Click Retry Machine Boot to reset the local Linux overlay and start a clean session.',
              });
              break;
            }
            await new Promise((r) => setTimeout(r, 1000));
          } else {
            rapidCrashCount = 0;
          }
        } catch (shellErr) {
          if (!isAliveRef.current || shellSessionIdRef.current !== sessionId) {
            break;
          }
          console.warn('[CheerpX] Shell exited or crashed:', shellErr);
          rapidCrashCount += 1;
          if (rapidCrashCount >= MAX_RAPID_SHELL_CRASHES) {
            shouldResetOnNextBootRef.current = true;
            cxRef.current = null;
            cxReadFuncRef.current = null;
            setIsReady(false);
            setBootError({
              title: 'Terminal Shell Crashed Repeatedly',
              message: shellErr?.message || 'Interactive shell terminated unexpectedly.',
              hint: 'Click Retry Machine Boot to reset the local Linux overlay.',
            });
            break;
          }
          await new Promise((r) => setTimeout(r, 1000));
        }
      }
    })();
  }, []);

  const bootVM = useCallback(
    async (options = {}) => {
      if (cxRef.current && !options?.forceResetOverlay) {
        return;
      }

      // Single-flight lock prevents React StrictMode double-invocation from racing CheerpX IDBDevice initialization
      if (bootPromiseRef.current) {
        return bootPromiseRef.current;
      }

      if (!isolation.isIsolated) {
        setBootError(isolation.error);
        return;
      }

      const forceResetOverlay = Boolean(options?.forceResetOverlay || shouldResetOnNextBootRef.current);

      const runBoot = (async () => {
        setIsBooting(true);
        setBootError(null);
        setBootProgress('Verifying security environment...');

        try {
          cleanupLegacyOverlayDatabases();

          setBootProgress('Loading CheerpX runtime from official CDN...');
          const CheerpX = await loadCheerpX();

          setBootProgress('Mounting virtual filesystems & storage...');
          const diskUrl = import.meta.env.VITE_CHEERPX_DISK_URL || DEFAULT_DISK_URL;
          const blockDevice = await createReadBlockDevice(CheerpX, diskUrl);

          setBootProgress('Initializing Linux machine...');
          const { cx, idbDevice } = await mountAndVerifyLinuxVM(CheerpX, blockDevice, {
            forceResetOverlay,
            onProgress: setBootProgress,
          });

          shouldResetOnNextBootRef.current = false;
          idbDeviceRef.current = idbDevice;
          cxRef.current = cx;
          pendingTerminalChunksRef.current = [];
          pendingTerminalBytesRef.current = 0;

          const sendInput = cx.setCustomConsole(
            (buf) => {
              const bytes = new Uint8Array(buf);
              if (silentCollectorRef.current) {
                silentCollectorRef.current(bytes);
              } else if (activeTerminalRef.current) {
                activeTerminalRef.current.write(bytes);
              } else if (pendingTerminalBytesRef.current < MAX_PENDING_TERMINAL_BYTES) {
                pendingTerminalChunksRef.current.push(bytes);
                pendingTerminalBytesRef.current += bytes.byteLength;
              }
            },
            80,
            24
          );

          cxReadFuncRef.current = sendInput;
          shellSessionIdRef.current += 1;
          const sessionId = shellSessionIdRef.current;

          setBootProgress('Machine online. Preparing interactive shell...');
          setIsReady(true);
          setIsBooting(false);

          startInteractiveShellLoop(cx, sessionId);
        } catch (err) {
          console.error('[CheerpX] Boot failed:', err);
          shouldResetOnNextBootRef.current = FATAL_LIB_ERROR_RE.test(err?.message || '');
          cxRef.current = null;
          cxReadFuncRef.current = null;
          setBootError({
            title: 'Virtual Machine Boot Failed',
            message: err.message || 'An error occurred while booting CheerpX.',
            hint: 'Check network connectivity to cxrtnc.leaningtech.com and disks.webvm.io, and ensure Cross-Origin Isolation headers are active.',
          });
          setIsBooting(false);
          setIsReady(false);
        } finally {
          bootPromiseRef.current = null;
        }
      })();

      bootPromiseRef.current = runBoot;
      return runBoot;
    },
    [isolation.isIsolated, isolation.error, startInteractiveShellLoop]
  );

  // Terminal attachment & detachment
  const attachTerminal = useCallback((term) => {
    activeTerminalRef.current = term;

    if (pendingTerminalChunksRef.current.length > 0) {
      for (const chunk of pendingTerminalChunksRef.current) {
        term.write(chunk);
      }
      pendingTerminalChunksRef.current = [];
      pendingTerminalBytesRef.current = 0;
    }

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
          env: BASE_ENV,
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

  // Reset overlay: clears user files and resets home directory (rebuilding IDB cache if corrupted)
  const resetVM = useCallback(async () => {
    if (!cxRef.current) return false;
    try {
      const res = await runCommand(
        'rm -rf /home/user/* /home/user/.* 2>/dev/null; mkdir -p /home/user/uploads && touch /home/user/.bash_history'
      );
      if (res.exitCode === 127 || FATAL_LIB_ERROR_RE.test(res.stdout)) {
        throw new Error(res.stdout || 'Shell unavailable during reset');
      }
      return true;
    } catch (err) {
      if (FATAL_LIB_ERROR_RE.test(err?.message || '') || !cxRef.current) {
        console.warn('[CheerpX] Reset hit corrupted filesystem; rebuilding IDB overlay:', err);
        shellSessionIdRef.current += 1;
        cxRef.current = null;
        cxReadFuncRef.current = null;
        setIsReady(false);
        await bootVM({ forceResetOverlay: true });
        return true;
      }
      console.error('[CheerpX] Reset failed:', err);
      throw err;
    }
  }, [runCommand, bootVM]);

  useEffect(() => {
    isAliveRef.current = true;
    return () => {
      isAliveRef.current = false;
    };
  }, []);

  const value = useMemo(
    () => ({
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
    }),
    [
      isReady,
      isBooting,
      bootProgress,
      bootError,
      isolation,
      bootVM,
      attachTerminal,
      runCommand,
      writeFile,
      readFile,
      listDir,
      resetVM,
    ]
  );

  return <VMContext.Provider value={value}>{children}</VMContext.Provider>;
}

export { VMContext };
