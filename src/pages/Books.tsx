import { useState } from 'react';
import { motion } from 'framer-motion';
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
  { value: 'title', label: 'Title A–Z' },
  { value: 'recent', label: 'Recently Added' },
];

// Framer Motion stagger variants for book grid
const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3 } },
};

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
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <h1 className="font-display text-3xl text-foreground">Book Catalog</h1>
        <p className="text-muted-foreground mt-1 text-sm">{books.length} books in the collection</p>
      </motion.div>

      {/* Search & Filters */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.25 }}
        className="bg-card rounded-2xl border border-border p-4 shadow-card space-y-4"
      >
        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by title, author, or tag…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-background border border-input text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
          />
        </div>

        {/* Filters row */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </div>

          {/* Category pills */}
          <div className="flex flex-wrap gap-1.5">
            {categories.map(cat => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                  category === cat.value
                    ? 'bg-accent text-accent-foreground shadow-sm'
                    : 'bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Right side controls */}
          <div className="ml-auto flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
              <input
                type="checkbox"
                checked={availableOnly}
                onChange={e => setAvailableOnly(e.target.checked)}
                className="rounded border-input accent-accent w-3.5 h-3.5"
              />
              Available only
            </label>

            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="text-xs bg-background border border-input rounded-lg px-3 py-1.5 text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
            >
              {sortOptions.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Results count */}
      {query || category || availableOnly ? (
        <p className="text-xs text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{filtered.length}</span> of {books.length} books
        </p>
      ) : null}

      {/* Book grid with stagger animation */}
      {filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <BookOpen className="w-14 h-14 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-lg text-muted-foreground font-display">No books found</p>
          <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filters</p>
        </motion.div>
      ) : (
        <motion.div
          key={`${query}-${category}-${sort}-${availableOnly}`}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-5"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {filtered.map(book => (
            <motion.div key={book.id} variants={itemVariants}>
              <BookCard book={book} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
