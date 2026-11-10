import { useEffect, useRef } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';

/**
 * Reads CSS token variables from document.documentElement at runtime.
 */
function getCssColor(varName, fallback) {
  if (typeof window === 'undefined') return fallback;
  const val = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  return val || fallback;
}

/**
 * Hook to manage xterm.js instance with strict dark editorial theme tokens.
 */
export function useXterm() {
  const containerRef = useRef(null);
  const termRef = useRef(null);
  const fitAddonRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Read colors from CSS custom properties at runtime
    const bg = getCssColor('--color-background', '#000000');
    const fg = getCssColor('--color-text-primary', '#FFFFFF');
    const cursor = getCssColor('--color-primary', '#770600');
    const selection = getCssColor('--color-dark-burgundy', '#4D0B08');
    const textSec = getCssColor('--color-text-secondary', '#BCB3B3');
    const secRed = getCssColor('--color-secondary-red', '#7A0401');
    const surface = getCssColor('--color-surface', '#161414');

    const term = new Terminal({
      cursorBlink: true,
      cursorStyle: 'block',
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: 14,
      lineHeight: 1.35,
      letterSpacing: 0,
      scrollback: 2000,
      theme: {
        background: bg,
        foreground: fg,
        cursor: cursor,
        cursorAccent: bg,
        selectionBackground: selection,
        // ANSI mapping strictly to brand tokens (no green/blue/yellow per prompt Section 2)
        black: bg,
        red: cursor,
        green: fg,
        yellow: secRed,
        blue: textSec,
        magenta: cursor,
        cyan: textSec,
        white: fg,
        brightBlack: surface,
        brightRed: secRed,
        brightGreen: fg,
        brightYellow: secRed,
        brightBlue: textSec,
        brightMagenta: cursor,
        brightCyan: textSec,
        brightWhite: fg,
      },
      convertEol: true,
      allowTransparency: false,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);

    term.open(containerRef.current);

    // Initial fit
    requestAnimationFrame(() => {
      try {
        fitAddon.fit();
      } catch {
        // ignore layout race
      }
    });

    termRef.current = term;
    fitAddonRef.current = fitAddon;

    // Resize observer to auto-fit terminal when panel is resized
    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(() => {
        try {
          if (containerRef.current && fitAddonRef.current) {
            fitAddonRef.current.fit();
          }
        } catch {
          // container not ready
        }
      });
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      term.dispose();
      termRef.current = null;
      fitAddonRef.current = null;
    };
  }, []);

  return {
    containerRef,
    termRef,
    fitAddonRef,
  };
}
