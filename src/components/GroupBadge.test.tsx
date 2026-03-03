import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GroupBadge } from './GroupBadge';

describe('GroupBadge', () => {
  it('renders group name', () => {
    render(<GroupBadge name="Work" color="blue" />);
    expect(screen.getByText('Work')).toBeInTheDocument();
  });

  it('applies group-badge class', () => {
    render(<GroupBadge name="Personal" color="green" />);
    const badge = screen.getByText('Personal');
    expect(badge).toHaveClass('group-badge');
  });

  it('applies inline styles for color', () => {
    render(<GroupBadge name="Test" color="red" />);
    const badge = screen.getByText('Test');
    expect(badge).toHaveStyle({ backgroundColor: '#ff4b4b', color: '#ffffff' });
  });

  it('handles unknown color with default grey', () => {
    render(<GroupBadge name="Unknown" color="unknown" />);
    const badge = screen.getByText('Unknown');
    expect(badge).toHaveStyle({ backgroundColor: '#707280', color: '#ffffff' });
  });
});
