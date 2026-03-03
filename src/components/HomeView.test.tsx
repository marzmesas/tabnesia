import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render, setMockTabAnalyticsResponse, mockTab } from '../test/test-utils';
import { HomeView } from './HomeView';
import { ACTIVE_THRESHOLD_MS, FORGOTTEN_THRESHOLD_MS } from '../utils/constants';

describe('HomeView', () => {
  const onNavigate = vi.fn();

  beforeEach(() => {
    onNavigate.mockClear();
  });

  it('shows loading state initially', () => {
    setMockTabAnalyticsResponse([]);
    render(<HomeView onNavigate={onNavigate} />);
    expect(screen.getByText(/loading tab data/i)).toBeInTheDocument();
  });

  it('shows section cards after data loads', async () => {
    const now = Date.now();
    setMockTabAnalyticsResponse([
      mockTab({ id: 1, url: 'https://a.com', lastAccessed: now }),
    ]);
    render(<HomeView onNavigate={onNavigate} />);
    await waitFor(() => {
      expect(screen.getByText('Active Tabs')).toBeInTheDocument();
    });
    expect(screen.getByText('Recently Inactive')).toBeInTheDocument();
    expect(screen.getByText('Forgotten Tabs')).toBeInTheDocument();
  });

  it('shows correct counts for active, inactive, and forgotten tabs', async () => {
    const now = Date.now();
    setMockTabAnalyticsResponse([
      mockTab({ id: 1, lastAccessed: now }), // active
      mockTab({ id: 2, lastAccessed: now - ACTIVE_THRESHOLD_MS - 1 }), // inactive (between 5 and 30 days)
      mockTab({ id: 3, lastAccessed: now - FORGOTTEN_THRESHOLD_MS - 1 }), // forgotten
    ]);
    render(<HomeView onNavigate={onNavigate} />);
    await waitFor(() => {
      expect(screen.getByText('Active Tabs')).toBeInTheDocument();
    });
    const activeCard = screen.getByRole('button', { name: /active tabs/i });
    const inactiveCard = screen.getByRole('button', { name: /recently inactive/i });
    const forgottenCard = screen.getByRole('button', { name: /forgotten tabs/i });
    expect(within(activeCard).getByText('1')).toBeInTheDocument();
    expect(within(inactiveCard).getByText('1')).toBeInTheDocument();
    expect(within(forgottenCard).getByText('1')).toBeInTheDocument();
  });

  it('navigates to section when card is clicked', async () => {
    const user = userEvent.setup();
    setMockTabAnalyticsResponse([mockTab({ id: 1 })]);
    render(<HomeView onNavigate={onNavigate} />);
    await waitFor(() => {
      expect(screen.getByText('Active Tabs')).toBeInTheDocument();
    });
    await user.click(screen.getByRole('button', { name: /forgotten tabs/i }));
    expect(onNavigate).toHaveBeenCalledWith('forgotten');
  });

  it('shows duplicate section when there are duplicate tabs', async () => {
    setMockTabAnalyticsResponse([
      mockTab({ id: 1, url: 'https://example.com' }),
      mockTab({ id: 2, url: 'https://example.com/' }),
    ]);
    render(<HomeView onNavigate={onNavigate} />);
    await waitFor(() => {
      expect(screen.getByText('Duplicate Tabs')).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /duplicate tabs/i })).toBeInTheDocument();
  });

  it('shows error message when context has error', async () => {
    const chrome = globalThis.chrome as { runtime: { sendMessage: ReturnType<typeof vi.fn> } };
    chrome.runtime.sendMessage.mockRejectedValueOnce(new Error('Failed'));
    render(<HomeView onNavigate={onNavigate} />);
    await waitFor(() => {
      expect(screen.getByText(/error:/i)).toBeInTheDocument();
    });
  });
});
