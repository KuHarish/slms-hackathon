import { useState } from 'react';
import { Search, SlidersHorizontal, BookOpen } from 'lucide-react';
import { books } from '@/data/mockData';
import BookCard from '@/components/BookCard';
import type { BookCategory } from '@/types/library';

const categories: { value: BookCategory | ''; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'fiction', label: 'Fiction' },
  { value: 'non-fiction', label: 'Non-Fiction' },
  { value: 'science', label: 'Science' },
  { value: 'technology', label: 'Technology' },
  { value: 'history', label: 'History' },
  { value: 'philosophy', label: 'Philosophy' },
  { value: 'mathematics', label: 'Mathematics' },
  { value: 'psychology', label: 'Psychology' },
];

const sortOptions = [
  { value: 'rating', label: 'Top Rated' },
  { value: 'title', label: 'Title A-Z' },
  { value: 'recent', label: 'Recently Added' },
];

export default function Books() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<BookCategory | ''>('');
  const [sort, setSort] = useState('rating');
  const [availableOnly, setAvailableOnly] = useState(false);

  let filtered = [...books];
  if (query) {
    const q = query.toLowerCase();
    filtered = filtered.filter(b =>
      b.title.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q) ||
      b.tags.some(t => t.includes(q))
    );
  }
  if (category) filtered = filtered.filter(b => b.category === category);
  if (availableOnly) filtered = filtered.filter(b => b.availableCopies > 0);
  if (sort === 'rating') filtered.sort((a, b) => b.rating - a.rating);
  if (sort === 'title') filtered.sort((a, b) => a.title.localeCompare(b.title));
  if (sort === 'recent') filtered.sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-foreground">Book Catalog</h1>
        <p className="text-muted-foreground mt-1">{books.length} books in the collection</p>
      </div>

      {/* Search & Filters */}
      <div className="bg-card rounded-xl border border-border p-4 shadow-card space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by title, author, or tag..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-lg bg-background border border-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters:</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  category === cat.value
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={availableOnly}
                onChange={e => setAvailableOnly(e.target.checked)}
                className="rounded border-input accent-accent"
              />
              Available only
            </label>

            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="text-sm bg-background border border-input rounded-lg px-3 py-1.5 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {sortOptions.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">No books found</p>
          <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
          {filtered.map(book => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </div>
  );
}
