import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { render, setMockTabAnalyticsResponse, mockTab } from '../test/test-utils';
import { TabAnalytics } from './TabAnalytics';

describe('TabAnalytics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state initially', () => {
    setMockTabAnalyticsResponse([]);
    render(<TabAnalytics />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows stats when data has loaded', async () => {
    setMockTabAnalyticsResponse([
      mockTab({ id: 1 }),
      mockTab({ id: 2 }),
    ]);
    render(<TabAnalytics />);
    await waitFor(() => {
      expect(screen.getByText('Total Tabs')).toBeInTheDocument();
    });
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Inactive')).toBeInTheDocument();
    expect(screen.getByText('Forgotten')).toBeInTheDocument();
    const statValues = screen.getAllByText('2');
    expect(statValues.length).toBeGreaterThanOrEqual(1);
  });

  it('shows error when fetch fails', async () => {
    const chrome = globalThis.chrome as { runtime: { sendMessage: ReturnType<typeof vi.fn> } };
    chrome.runtime.sendMessage.mockRejectedValueOnce(new Error('Network error'));
    render(<TabAnalytics />);
    await waitFor(() => {
      expect(screen.getByText(/error:/i)).toBeInTheDocument();
    });
  });

  it('shows Duplicates stat when there are duplicate tabs', async () => {
    setMockTabAnalyticsResponse([
      mockTab({ id: 1, url: 'https://example.com' }),
      mockTab({ id: 2, url: 'https://example.com/' }),
    ]);
    render(<TabAnalytics />);
    await waitFor(() => {
      expect(screen.getByText('Duplicates')).toBeInTheDocument();
    });
    expect(screen.getByText('1')).toBeInTheDocument(); // 1 duplicate (2 tabs, 1 extra)
  });
});
