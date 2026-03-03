import { describe, it, expect } from 'vitest';
import { normalizeUrl, findDuplicates } from './urlUtils';
import type { TabAnalytics } from '../context/TabContext';

describe('normalizeUrl', () => {
  it('lowercases the host', () => {
    expect(normalizeUrl('https://EXAMPLE.com/path')).toBe('https://example.com/path');
  });

  it('strips the fragment', () => {
    expect(normalizeUrl('https://example.com/page#section')).toBe('https://example.com/page');
  });

  it('strips trailing slash from path but keeps root', () => {
    expect(normalizeUrl('https://example.com/path/')).toBe('https://example.com/path');
    expect(normalizeUrl('https://example.com/')).toBe('https://example.com/');
  });

  it('combines host lowercasing, fragment strip, and trailing slash', () => {
    expect(normalizeUrl('https://EXAMPLE.com/foo/#anchor')).toBe('https://example.com/foo');
  });

  it('returns original string for invalid URL', () => {
    const invalid = 'not-a-url';
    expect(normalizeUrl(invalid)).toBe(invalid);
  });

  it('handles URLs with query string', () => {
    expect(normalizeUrl('https://example.com/search?q=test')).toBe(
      'https://example.com/search?q=test'
    );
  });
});

describe('findDuplicates', () => {
  const now = Date.now();
  const makeTab = (id: number, url: string, lastAccessed = now): TabAnalytics =>
    ({
      id,
      url,
      title: `Tab ${id}`,
      groupId: -1,
      lastAccessed,
      discarded: false,
      active: false,
    }) as TabAnalytics;

  it('returns empty array when no duplicates', () => {
    const tabs = [
      makeTab(1, 'https://a.com'),
      makeTab(2, 'https://b.com'),
    ];
    expect(findDuplicates(tabs)).toEqual([]);
  });

  it('groups tabs by normalized URL', () => {
    const tabs = [
      makeTab(1, 'https://example.com', 100),
      makeTab(2, 'https://example.com/', 200),
      makeTab(3, 'https://EXAMPLE.com', 300),
    ];
    const result = findDuplicates(tabs);
    expect(result).toHaveLength(1);
    expect(result[0].tabs).toHaveLength(3);
    expect(result[0].normalizedUrl).toBe('https://example.com/');
  });

  it('sorts tabs within group by lastAccessed descending', () => {
    const tabs = [
      makeTab(1, 'https://example.com', 100),
      makeTab(2, 'https://example.com', 300),
      makeTab(3, 'https://example.com', 200),
    ];
    const result = findDuplicates(tabs);
    expect(result[0].tabs.map((t) => t.id)).toEqual([2, 3, 1]);
  });

  it('sorts groups by duplicate count descending', () => {
    const tabs = [
      makeTab(1, 'https://a.com'),
      makeTab(2, 'https://a.com'),
      makeTab(3, 'https://b.com'),
      makeTab(4, 'https://b.com'),
      makeTab(5, 'https://b.com'),
    ];
    const result = findDuplicates(tabs);
    expect(result).toHaveLength(2);
    expect(result[0].tabs).toHaveLength(3);
    expect(result[0].normalizedUrl).toContain('b.com');
    expect(result[1].tabs).toHaveLength(2);
    expect(result[1].normalizedUrl).toContain('a.com');
  });

  it('treats URLs that differ only by fragment as same', () => {
    const tabs = [
      makeTab(1, 'https://example.com/page#one'),
      makeTab(2, 'https://example.com/page#two'),
    ];
    const result = findDuplicates(tabs);
    expect(result).toHaveLength(1);
    expect(result[0].tabs).toHaveLength(2);
  });
});
