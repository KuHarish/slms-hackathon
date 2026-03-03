import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Star, BookOpen, Bell, Clock, Users,
  MessageSquare, ThumbsUp, Send
} from 'lucide-react';
import { books, reviews as allReviews } from '@/data/mockData';

export default function BookDetail() {
  const { id } = useParams();
  const book = books.find(b => b.id === id);
  const bookReviews = allReviews.filter(r => r.bookId === id);
  const [notifyMe, setNotifyMe] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(0);

  if (!book) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Book not found.</p>
        <Link to="/books" className="text-accent hover:underline mt-2 inline-block">Back to catalog</Link>
      </div>
    );
  }

  const available = book.availableCopies > 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Link to="/books" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to catalog
      </Link>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Cover */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="aspect-[3/4] rounded-xl bg-muted flex items-center justify-center overflow-hidden relative">
            <div className="absolute inset-0 gradient-navy opacity-80" />
            <BookOpen className="w-16 h-16 text-primary-foreground/30 relative z-10" />
            <div className="absolute bottom-4 left-4 right-4 z-10">
              <p className="text-primary-foreground/80 text-sm font-medium">{book.author}</p>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="flex-1 space-y-5">
          <div>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-accent/20 text-accent-foreground mb-2 inline-block">
              {book.category}
            </span>
            <h1 className="font-display text-3xl text-foreground mt-2">{book.title}</h1>
            <p className="text-lg text-muted-foreground mt-1">by {book.author}</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(s => (
                <Star key={s} className={`w-5 h-5 ${s <= Math.round(book.rating) ? 'text-gold fill-gold' : 'text-muted'}`} />
              ))}
              <span className="ml-2 text-sm font-medium text-foreground">{book.rating}</span>
            </div>
            <span className="text-sm text-muted-foreground">({book.reviewCount} reviews)</span>
          </div>

          <p className="text-foreground/80 leading-relaxed">{book.description}</p>

          <div className="flex flex-wrap gap-2">
            {book.tags.map(tag => (
              <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground">#{tag}</span>
            ))}
          </div>

          {/* Availability */}
          <div className="bg-card rounded-xl border border-border p-5 shadow-card">
            <h3 className="font-semibold text-card-foreground mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-accent" /> Availability
            </h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-foreground">{book.totalCopies}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
              <div>
                <p className={`text-2xl font-bold ${available ? 'text-success' : 'text-destructive'}`}>{book.availableCopies}</p>
                <p className="text-xs text-muted-foreground">Available</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{book.totalCopies - book.availableCopies}</p>
                <p className="text-xs text-muted-foreground">Issued</p>
              </div>
            </div>

            {!available && (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setNotifyMe(true)}
                disabled={notifyMe}
                className={`mt-4 w-full py-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 ${
                  notifyMe
                    // Fix #3: Use text-muted-foreground for proper contrast in both light and dark mode
                    ? 'bg-muted text-muted-foreground cursor-default'
                    // Fix #3: gradient-gold uses hsl(--gold) background; text-primary-foreground is 
                    // defined as the contrasting foreground for the primary/gold background in both themes
                    : 'gradient-gold text-primary-foreground hover:opacity-90 active:scale-95'
                }`}
              >
                <Bell className="w-4 h-4" />
                {notifyMe ? 'You will be notified!' : 'Notify Me When Available'}
              </motion.button>
            )}
          </div>

          <p className="text-xs text-muted-foreground">ISBN: {book.isbn}</p>
        </div>
      </div>

      {/* Reviews Section */}
      <section>
        <h2 className="font-display text-2xl text-foreground mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-accent" /> Reviews & Discussion
        </h2>

        {/* Write Review */}
        <div className="bg-card rounded-xl border border-border p-5 shadow-card mb-6">
          <h3 className="font-semibold text-card-foreground mb-3">Write a Review</h3>
          <div className="flex gap-1 mb-3">
            {[1, 2, 3, 4, 5].map(s => (
              <button key={s} onClick={() => setRating(s)}>
                <Star className={`w-6 h-6 transition-colors ${s <= rating ? 'text-gold fill-gold' : 'text-muted hover:text-gold/50'}`} />
              </button>
            ))}
          </div>
          <textarea
            value={reviewText}
            onChange={e => setReviewText(e.target.value)}
            placeholder="Share your thoughts about this book..."
            className="w-full p-3 rounded-lg bg-background border border-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none h-24"
          />
          <button className="mt-3 px-5 py-2.5 rounded-lg gradient-gold text-primary text-sm font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity">
            <Send className="w-4 h-4" /> Submit Review
          </button>
        </div>

        {/* Existing Reviews */}
        <div className="space-y-4">
          {bookReviews.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No reviews yet. Be the first!</p>
          ) : (
            bookReviews.map(review => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-card rounded-xl border border-border p-5 shadow-card"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center text-xs font-bold text-accent-foreground">
                    {review.userName.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-medium text-card-foreground flex items-center gap-2">
                      {review.userName}
                      {review.userBadge && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent-foreground" title={review.userBadge.name}>
                          {review.userBadge.icon} {review.userBadge.name}
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                </div>
                <div className="flex gap-0.5 mb-2">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star key={s} className={`w-4 h-4 ${s <= review.rating ? 'text-gold fill-gold' : 'text-muted'}`} />
                  ))}
                </div>
                <p className="text-foreground/80 text-sm leading-relaxed">{review.content}</p>
                <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                  <button className="flex items-center gap-1 hover:text-accent transition-colors">
                    <ThumbsUp className="w-4 h-4" /> {review.likes}
                  </button>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-4 h-4" /> {review.comments.length}
                  </span>
                </div>

                {review.comments.length > 0 && (
                  <div className="mt-4 pl-4 border-l-2 border-border space-y-3">
                    {review.comments.map(comment => (
                      <div key={comment.id} className="text-sm">
                        <p className="font-medium text-card-foreground">{comment.userName}</p>
                        <p className="text-muted-foreground">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
