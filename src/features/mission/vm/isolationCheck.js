/**
 * isolationCheck.js — Verifies browser Cross-Origin Isolation status.
 *
 * CheerpX and WebAssembly SharedArrayBuffer strictly require crossOriginIsolated to be true.
 * This file detects isolation and provides clear actionable diagnostic messages.
 */

export function checkCrossOriginIsolation() {
  if (typeof window === 'undefined') {
    return { isIsolated: true, error: null };
  }

  const isIsolated = Boolean(window.crossOriginIsolated);

  if (!isIsolated) {
    return {
      isIsolated: false,
      error: {
        title: 'Cross-Origin Isolation Required',
        message:
          'CheerpX requires SharedArrayBuffer, which is disabled unless the host serves strict security headers.',
        details: [
          'Cross-Origin-Opener-Policy: same-origin',
          'Cross-Origin-Embedder-Policy: require-corp',
        ],
        hint: 'In Vite dev, ensure server.headers has COOP and COEP configured. In production, configure your reverse proxy or CDN with these response headers.',
      },
    };
  }

  return { isIsolated: true, error: null };
}
