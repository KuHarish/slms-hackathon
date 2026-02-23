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
      className="group block bg-card rounded-xl border border-border p-5 shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-1"
    >
      {/* Cover placeholder */}
      <div className="aspect-[3/4] rounded-lg bg-muted mb-4 flex items-center justify-center overflow-hidden relative">
        <div className="absolute inset-0 gradient-navy opacity-80" />
        <BookOpen className="w-12 h-12 text-primary-foreground/40 relative z-10" />
        <div className="absolute bottom-3 left-3 right-3 z-10">
          <p className="text-primary-foreground/90 text-xs font-medium truncate">{book.author}</p>
        </div>
      </div>

      {/* Info */}
      <h3 className="font-display text-base text-card-foreground group-hover:text-accent transition-colors line-clamp-2 leading-snug mb-2">
        {book.title}
      </h3>

      <p className="text-sm text-muted-foreground mb-3">{book.author}</p>

      <div className="flex items-center justify-between">
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${categoryColors[book.category] || 'bg-muted text-muted-foreground'}`}>
          {book.category}
        </span>
        <div className="flex items-center gap-1 text-sm">
          <Star className="w-3.5 h-3.5 text-gold fill-gold" />
          <span className="text-muted-foreground font-medium">{book.rating}</span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs">
        <span className={available ? 'text-success font-medium' : 'text-destructive font-medium'}>
          {available ? `${book.availableCopies} available` : 'Unavailable'}
        </span>
        <span className="text-muted-foreground">{book.reviewCount} reviews</span>
      </div>
    </Link>
  );
}
