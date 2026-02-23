import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Star, MessageSquare, ThumbsUp, BookOpen, TrendingUp } from 'lucide-react';
import { reviews, books } from '@/data/mockData';

export default function Community() {
  const recentReviews = reviews
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map(r => ({ ...r, book: books.find(b => b.id === r.bookId) }));

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="font-display text-3xl text-foreground">Community</h1>
        <p className="text-muted-foreground mt-1">Book discussions, reviews, and recommendations from fellow readers.</p>
      </div>

      {/* Activity Feed */}
      <div className="space-y-4">
        {recentReviews.map((review, i) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-card rounded-xl border border-border p-5 shadow-card"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-xs font-bold text-accent-foreground flex-shrink-0">
                {review.userName.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-card-foreground">{review.userName}</span>
                  {review.userBadge && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent-foreground">
                      {review.userBadge.icon} {review.userBadge.name}
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">reviewed</span>
                </div>

                <Link
                  to={`/books/${review.bookId}`}
                  className="mt-1 flex items-center gap-2 text-sm font-medium text-accent hover:underline"
                >
                  <BookOpen className="w-4 h-4" />
                  {review.book?.title}
                </Link>

                <div className="flex gap-0.5 mt-2">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star key={s} className={`w-4 h-4 ${s <= review.rating ? 'text-gold fill-gold' : 'text-muted'}`} />
                  ))}
                </div>

                <p className="text-foreground/80 text-sm leading-relaxed mt-2">{review.content}</p>

                <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                  <button className="flex items-center gap-1.5 hover:text-accent transition-colors">
                    <ThumbsUp className="w-4 h-4" /> {review.likes}
                  </button>
                  <button className="flex items-center gap-1.5 hover:text-accent transition-colors">
                    <MessageSquare className="w-4 h-4" /> {review.comments.length} replies
                  </button>
                  <span className="ml-auto text-xs">
                    {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>

                {review.comments.length > 0 && (
                  <div className="mt-4 pl-4 border-l-2 border-border space-y-3">
                    {review.comments.map(c => (
                      <div key={c.id} className="text-sm">
                        <span className="font-medium text-card-foreground">{c.userName}</span>
                        <span className="text-muted-foreground ml-2">{c.content}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
