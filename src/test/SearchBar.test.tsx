import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchBar } from '@/components/search/SearchBar';

describe('SearchBar', () => {
  it('renders the search input', () => {
    render(<SearchBar onSearch={vi.fn()} />);
    expect(screen.getByRole('searchbox')).toBeInTheDocument();
  });

  it('calls onSearch with the query on submit', async () => {
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);
    await userEvent.type(screen.getByRole('searchbox'), 'Lagos');
    await userEvent.click(screen.getByText('Search'));
    expect(onSearch).toHaveBeenCalledWith(expect.objectContaining({ query: 'Lagos' }));
  });

  it('has accessible label', () => {
    render(<SearchBar onSearch={vi.fn()} />);
    expect(screen.getByRole('search', { name: /search hospitals/i })).toBeInTheDocument();
  });
});
