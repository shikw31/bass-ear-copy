// NetworkStatusMonitor (see nfr-design/logical-components.md).
// Thin wrapper around the browser's online/offline events so callers don't touch window directly.

export function isOnline(): boolean {
  return typeof navigator === "undefined" ? true : navigator.onLine;
}

export function onNetworkRegained(callback: () => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }
  window.addEventListener("online", callback);
  return () => window.removeEventListener("online", callback);
}
