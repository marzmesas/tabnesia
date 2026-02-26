import type { TabAnalytics } from '../context/TabContext';

export interface DuplicateGroup {
  normalizedUrl: string;
  tabs: TabAnalytics[];
}

/**
 * Normalize a URL for duplicate comparison:
 * - lowercase the host
 * - strip trailing slashes
 * - strip fragment (#...)
 */
export function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.hostname = parsed.hostname.toLowerCase();
    // Remove fragment
    parsed.hash = '';
    // Remove trailing slash from pathname (keep root "/")
    if (parsed.pathname.length > 1 && parsed.pathname.endsWith('/')) {
      parsed.pathname = parsed.pathname.slice(0, -1);
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

/**
 * Find duplicate tabs grouped by normalized URL.
 * Returns groups with 2+ tabs, sorted by count descending.
 * Within each group, tabs are sorted by lastAccessed descending (first = keeper).
 */
export function findDuplicates(tabs: TabAnalytics[]): DuplicateGroup[] {
  const groups = new Map<string, TabAnalytics[]>();

  for (const tab of tabs) {
    const key = normalizeUrl(tab.url);
    const existing = groups.get(key);
    if (existing) {
      existing.push(tab);
    } else {
      groups.set(key, [tab]);
    }
  }

  const duplicates: DuplicateGroup[] = [];
  for (const [normalizedUrl, groupTabs] of groups) {
    if (groupTabs.length >= 2) {
      // Sort by lastAccessed desc — first tab is the keeper
      groupTabs.sort((a, b) => b.lastAccessed - a.lastAccessed);
      duplicates.push({ normalizedUrl, tabs: groupTabs });
    }
  }

  // Sort groups by count descending
  duplicates.sort((a, b) => b.tabs.length - a.tabs.length);

  return duplicates;
}
