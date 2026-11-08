/**
 * cheerpxLoader.js — Resilient dynamic loader for CheerpX.
 *
 * In accordance with the CheerpX Community License, the runtime is loaded from the
 * official Leaning Technologies CDN (https://cxrtnc.leaningtech.com/) via the official
 * @leaningtech/cheerpx library or direct ESM import. We NEVER self-host or redistribute the runtime.
 */

let cheerpxInstancePromise = null;

export async function loadCheerpX() {
  if (cheerpxInstancePromise) {
    return cheerpxInstancePromise;
  }

  cheerpxInstancePromise = (async () => {
    // Attempt 1: npm package import
    try {
      const CheerpX = await import('@leaningtech/cheerpx');
      if (CheerpX && (CheerpX.Linux || CheerpX.default?.Linux)) {
        return CheerpX.Linux ? CheerpX : CheerpX.default;
      }
    } catch (npmErr) {
      console.warn('[CheerpX] Package import failed, falling back to CDN ESM:', npmErr);
    }

    // Attempt 2: Direct official CDN ESM import
    try {
      const cdnUrl = 'https://cxrtnc.leaningtech.com/1.4.0/cx.esm.js';
      // Use dynamic Function constructor to avoid Vite build-time static import transformations
      const dynamicImport = new Function('url', 'return import(url)');
      const CheerpX = await dynamicImport(cdnUrl);
      return CheerpX;
    } catch (cdnErr) {
      console.error('[CheerpX] Failed to load CheerpX runtime:', cdnErr);
      throw new Error(
        'Failed to load CheerpX runtime from cxrtnc.leaningtech.com. Please check your internet connection or network blockers.'
      );
    }
  })();

  return cheerpxInstancePromise;
}
