import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Mock Chrome extension APIs so components and context can run in tests
const mockSendMessage = vi.fn();

vi.stubGlobal('chrome', {
  runtime: {
    sendMessage: mockSendMessage,
    lastError: null,
  },
  storage: {
    local: {
      get: (keys: string | string[] | null, callback?: (result: Record<string, unknown>) => void) => {
        const result = keys === null ? {} : Array.isArray(keys)
          ? keys.reduce<Record<string, unknown>>((acc, k) => ({ ...acc, [k]: undefined }), {})
          : { [keys]: undefined };
        if (callback) callback(result);
        return Promise.resolve(result);
      },
      set: (_items: Record<string, unknown>, callback?: () => void) => {
        if (callback) callback();
        return Promise.resolve();
      },
    },
  },
  tabs: {
    query: vi.fn(),
    remove: vi.fn(),
    discard: vi.fn(),
    onRemoved: { addListener: vi.fn(), removeListener: vi.fn() },
    onCreated: { addListener: vi.fn(), removeListener: vi.fn() },
  },
  tabGroups: { query: vi.fn() },
  action: { setBadgeText: vi.fn(), setBadgeBackgroundColor: vi.fn() },
});

// Default: getTabGroups returns [], getTabAnalytics returns []
mockSendMessage.mockImplementation((request: { action: string }) => {
  if (request.action === 'getTabGroups') return Promise.resolve([]);
  if (request.action === 'getTabAnalytics') return Promise.resolve([]);
  return Promise.resolve(undefined);
});

afterEach(() => {
  cleanup();
  mockSendMessage.mockClear();
  mockSendMessage.mockImplementation((request: { action: string }) => {
    if (request.action === 'getTabGroups') return Promise.resolve([]);
    if (request.action === 'getTabAnalytics') return Promise.resolve([]);
    return Promise.resolve(undefined);
  });
});
