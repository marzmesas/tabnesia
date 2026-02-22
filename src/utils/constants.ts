export const ACTIVE_THRESHOLD_DAYS = 5;
export const FORGOTTEN_THRESHOLD_DAYS = 30;
export const STALE_CLEANUP_DAYS = 90;

// Pre-computed millisecond values for convenience
export const ACTIVE_THRESHOLD_MS = ACTIVE_THRESHOLD_DAYS * 24 * 60 * 60 * 1000;
export const FORGOTTEN_THRESHOLD_MS = FORGOTTEN_THRESHOLD_DAYS * 24 * 60 * 60 * 1000;
export const STALE_CLEANUP_MS = STALE_CLEANUP_DAYS * 24 * 60 * 60 * 1000;
