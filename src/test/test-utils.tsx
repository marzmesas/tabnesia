import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { vi } from 'vitest';
import { TabProvider } from '../context/TabContext';
import { SearchProvider } from '../context/SearchContext';
import { ThemeProvider } from '../hooks/useTheme';
import type { TabAnalytics } from '../context/TabContext';

/**
 * Create a custom render that wraps UI with TabProvider, SearchProvider, and ThemeProvider.
 * Use when testing components that need tab/search/theme context.
 */
function AllProviders({ children }: { children: React.ReactNode }) {
  return (
    <TabProvider>
      <SearchProvider>
        <ThemeProvider>{children}</ThemeProvider>
      </SearchProvider>
    </TabProvider>
  );
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & { wrapper?: React.ComponentType<{ children: React.ReactNode }> }
) => {
  const Wrapper = options?.wrapper ?? AllProviders;
  return render(ui, {
    ...options,
    wrapper: Wrapper as React.ComponentType<{ children: React.ReactNode }>,
  });
};

export * from '@testing-library/react';
export { customRender as render };

/**
 * Build mock tab data for tests. Pass partial overrides.
 */
export function mockTab(overrides: Partial<TabAnalytics> = {}): TabAnalytics {
  const now = Date.now();
  return {
    id: 1,
    url: 'https://example.com',
    title: 'Example',
    groupId: -1,
    lastAccessed: now,
    discarded: false,
    active: false,
    ...overrides,
  };
}

/**
 * Set the response for getTabAnalytics so TabProvider receives these tabs.
 * Call this before rendering a component that uses TabProvider.
 */
export function setMockTabAnalyticsResponse(tabs: TabAnalytics[]) {
  const chrome = globalThis.chrome as {
    runtime: { sendMessage: ReturnType<typeof vi.fn> };
  };
  chrome.runtime.sendMessage.mockImplementation((request: { action: string }) => {
    if (request.action === 'getTabGroups') return Promise.resolve([]);
    if (request.action === 'getTabAnalytics') return Promise.resolve(tabs);
    return Promise.resolve(undefined);
  });
}
