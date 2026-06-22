import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Star, MessageSquare, ThumbsUp, BookOpen, Loader2, Filter } from 'lucide-react';

import { API_URL } from '@/config';
const API = API_URL.replace('/api', ''); // Temp fix to maintain compat

export default function Community() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  // Fetch available categories (genres) that have at least one review
  useEffect(() => {
    fetch(`${API}/api/reviews/categories`)
      .then(r => r.json())
      .then(data => setCategories(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  // Fetch reviews whenever the active category changes
  useEffect(() => {
    setLoading(true);
    const url =
      activeCategory === 'All'
        ? `${API}/api/reviews`
        : `${API}/api/reviews?category=${encodeURIComponent(activeCategory)}`;

    fetch(url)
      .then(r => r.json())
      .then(data => {
        setReviews(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [activeCategory]);

  const allCategoryPills = ['All', ...categories];

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl text-foreground">Community</h1>
        <p className="text-muted-foreground mt-1">Book discussions, reviews, and recommendations from fellow readers.</p>
      </div>

      {/* Genre filter pills */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="w-4 h-4" />
          <span className="font-medium">Filter by genre</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {allCategoryPills.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${
                activeCategory === cat
                  ? 'gradient-gold text-primary-foreground border-transparent shadow-glow'
                  : 'bg-card text-muted-foreground border-border hover:border-accent/50 hover:text-foreground'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Review Feed */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-7 h-7 text-muted-foreground animate-spin" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-12 text-center shadow-card">
            <BookOpen className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">
              {activeCategory === 'All'
                ? 'No reviews yet. Be the first to submit one!'
                : `No reviews found for genre "${activeCategory}".`}
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {reviews.map((review, i) => (
              <motion.div
                key={review._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card rounded-xl border border-border p-5 shadow-card"
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-xs font-bold text-accent-foreground flex-shrink-0">
                    {review.userName?.split(' ').map((n: string) => n[0]).join('') || '?'}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* User + book info */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-card-foreground">{review.userName}</span>
                      <span className="text-xs text-muted-foreground">reviewed</span>
                    </div>

                    <Link
                      to={`/books/${review.bookId}`}
                      className="mt-1 flex items-center gap-2 text-sm font-medium text-accent hover:underline"
                    >
                      <BookOpen className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{review.bookTitle}</span>
                    </Link>

                    {/* Genre badge */}
                    {review.bookCategory && (
                      <span className="mt-1.5 inline-block text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent-foreground font-medium">
                        {review.bookCategory}
                      </span>
                    )}

                    {/* Stars */}
                    <div className="flex gap-0.5 mt-2">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} className={`w-4 h-4 ${s <= review.rating ? 'text-gold fill-gold' : 'text-muted'}`} />
                      ))}
                    </div>

                    {/* Review content */}
                    <p className="text-foreground/80 text-sm leading-relaxed mt-2">{review.content}</p>

                    {/* Footer */}
                    <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <ThumbsUp className="w-4 h-4" /> {review.likes}
                      </span>
                      <span className="ml-auto text-xs">
                        {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
