import { Link } from 'react-router-dom';
import { Star, BookOpen } from 'lucide-react';
import type { Book } from '@/types/library';

const categoryColors: Record<string, string> = {
  fiction: 'bg-info/10 text-info',
  'non-fiction': 'bg-success/10 text-success',
  science: 'bg-accent/20 text-accent-foreground',
  technology: 'bg-primary/10 text-primary',
  history: 'bg-warning/10 text-warning',
  philosophy: 'bg-muted text-muted-foreground',
  mathematics: 'bg-destructive/10 text-destructive',
  literature: 'bg-secondary text-secondary-foreground',
  art: 'bg-accent/20 text-accent-foreground',
  psychology: 'bg-info/10 text-info',
};

export default function BookCard({ book }: { book: Book }) {
  const available = book.availableCopies > 0;

  return (
    <Link
      to={`/books/${book.id}`}
      className="group flex flex-col bg-card rounded-2xl border border-border shadow-card overflow-hidden
                 hover:shadow-elevated hover:-translate-y-1.5 transition-all duration-300"
    >
      {/* Book cover */}
      <div className="aspect-[3/4] relative overflow-hidden bg-muted flex-shrink-0">
        {book.coverUrl ? (
          <img
            src={book.coverUrl}
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <>
            <div className="absolute inset-0 gradient-navy" />
            {/* Decorative lines */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-4 left-4 right-4 h-px bg-white/60" />
              <div className="absolute top-8 left-4 right-8 h-px bg-white/30" />
            </div>
            <BookOpen className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 text-primary-foreground/25" />
            {/* Author overlay */}
            <div className="absolute bottom-0 left-0 right-0 px-3 pb-3 pt-8 bg-gradient-to-t from-black/60 to-transparent">
              <p className="text-white/90 text-xs font-medium truncate">{book.author}</p>
            </div>
          </>
        )}

        {/* Availability badge */}
        <div className={`absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-semibold leading-none ${
          available
            ? 'bg-success/90 text-white'
            : 'bg-destructive/80 text-white'
        }`}>
          {available ? 'Available' : 'Checked Out'}
        </div>
      </div>

      {/* Info section */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <h3 className="font-display text-[0.93rem] text-card-foreground group-hover:text-accent transition-colors line-clamp-2 leading-snug">
          {book.title}
        </h3>

        <p className="text-xs text-muted-foreground truncate">{book.author}</p>

        <div className="mt-auto pt-2 flex items-center justify-between">
          {/* Category pill */}
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${categoryColors[book.category] || 'bg-muted text-muted-foreground'}`}>
            {book.category}
          </span>

          {/* Rating */}
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 text-gold fill-gold" />
            <span className="text-xs text-muted-foreground font-semibold">{book.rating}</span>
          </div>
        </div>

        {/* Copies info */}
        <div className="text-xs text-muted-foreground pt-1 border-t border-border flex items-center justify-between">
          <span className={available ? 'text-success font-medium' : 'text-destructive font-medium'}>
            {available ? `${book.availableCopies} copies left` : 'Unavailable'}
          </span>
          <span>{book.reviewCount} reviews</span>
        </div>
      </div>
    </Link>
  );
}
