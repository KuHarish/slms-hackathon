import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Star, BookOpen, Bell, Clock, Users,
  MessageSquare, ThumbsUp, Send, Loader2, BookmarkPlus
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import BarcodeScanner from '@/components/BarcodeScanner';

import { API_URL } from '@/config';
const API = API_URL.replace('/api', ''); // Temp fix to maintain compat

export default function BookDetail() {
  const { id } = useParams();
  const { user } = useAuth();

  const [book, setBook] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notifyMe, setNotifyMe] = useState(() => {
    if (typeof window !== 'undefined' && id) {
      return localStorage.getItem(`notify_${id}`) === 'true';
    }
    return false;
  });
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(0);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [actionError, setActionError] = useState('');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [reserveLoading, setReserveLoading] = useState(false);

  const [showScanner, setShowScanner] = useState(false);

  const fetchBookDetails = () => {
    if (!id) return;
    setLoading(true);
    fetch(`${API}/api/books/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Book not found');
        return res.json();
      })
      .then(data => {
        setBook({
          ...data,
          id: data._id,
          availableCopies: data.availableCopies !== undefined ? data.availableCopies : data.available_copies,
          totalCopies: data.totalCopies !== undefined ? data.totalCopies : data.total_copies,
          rating: data.rating || 4.0,
          tags: data.tags || []
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  // Fetch book details
  useEffect(() => {
    fetchBookDetails();
  }, [id]);

  // Fetch live reviews for this book
  useEffect(() => {
    if (!id) return;
    setLoadingReviews(true);
    fetch(`${API}/api/reviews/book/${id}`)
      .then(res => res.json())
      .then(data => {
        setReviews(Array.isArray(data) ? data : []);
        setLoadingReviews(false);
      })
      .catch(() => setLoadingReviews(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <Loader2 className="w-10 h-10 text-muted-foreground animate-spin" />
      </div>
    );
  }

  if (!book) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Book not found.</p>
        <Link to="/books" className="text-accent hover:underline mt-2 inline-block">Back to catalog</Link>
      </div>
    );
  }

  const available = book.availableCopies > 0;

  const handleSubmitReview = async () => {
    setSubmitError('');
    setSubmitSuccess('');

    if (rating === 0) {
      setSubmitError('Please select a star rating.');
      return;
    }
    if (!reviewText.trim()) {
      setSubmitError('Please write something in your review.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setSubmitError('You must be logged in to submit a review.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API}/api/reviews/book/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating, content: reviewText }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSubmitError(data.message || 'Failed to submit review.');
      } else {
        // Prepend the new review optimistically
        setReviews(prev => [data, ...prev]);
        setReviewText('');
        setRating(0);
        setSubmitSuccess('Review submitted! Thank you.');
      }
    } catch {
      setSubmitError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckout = () => {
    setActionError('');
    setActionMessage('');
    if (!user) {
      setActionError('You must be logged in to checkout a book.');
      return;
    }
    setShowScanner(true);
  };

  const handleScannerSuccess = (data: any) => {
    setShowScanner(false);
    setActionMessage('Book checked out successfully!');
    fetchBookDetails(); // Refresh books counts
  };

  const handleReserve = async () => {
    setActionError('');
    setActionMessage('');
    if (!user) {
      setActionError('You must be logged in to reserve a book.');
      return;
    }
    setReserveLoading(true);
    try {
      const res = await fetch(`${API}/api/reserve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: user._id || user.id, book_id: id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setActionError(data.message || 'Failed to reserve book.');
      } else {
        setActionMessage('Book reserved successfully!');
      }
    } catch {
      setActionError('Network error. Please try again.');
    } finally {
      setReserveLoading(false);
    }
  };


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
            <span className="text-sm text-muted-foreground">({reviews.length} reviews)</span>
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

            {actionError && (
              <p className="text-destructive text-sm mt-4 text-center">{actionError}</p>
            )}
            {actionMessage && (
              <p className="text-success text-sm mt-4 text-center">{actionMessage}</p>
            )}

            <div className="flex flex-col gap-2 mt-4">
              {available && (
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleCheckout}
                  disabled={checkoutLoading}
                  className="w-full py-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 disabled:opacity-70"
                >
                  {checkoutLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <BookOpen className="w-4 h-4" />}
                  Checkout Now
                </motion.button>
              )}
              
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleReserve}
                disabled={reserveLoading}
                className="w-full py-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 bg-secondary text-secondary-foreground hover:bg-secondary/90 active:scale-95 disabled:opacity-70"
              >
                {reserveLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <BookmarkPlus className="w-4 h-4" />}
                {available ? "Reserve (1 Hour Hold)" : "Join Reservation Queue"}
              </motion.button>

              {!available && (
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    setNotifyMe(true);
                    if (id) localStorage.setItem(`notify_${id}`, 'true');
                    setActionMessage('You will be notified when this book becomes available!');
                    setActionError('');
                  }}
                  disabled={notifyMe}
                  className={`w-full py-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 ${
                    notifyMe
                      ? 'bg-muted text-muted-foreground cursor-default'
                      : 'border border-border bg-background hover:bg-accent hover:text-accent-foreground text-foreground active:scale-95'
                  }`}
                >
                  <Bell className="w-4 h-4" />
                  {notifyMe ? 'You will be notified!' : 'Notify Me When Available'}
                </motion.button>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1 mt-6">
            <p className="text-xs text-muted-foreground font-mono">ISBN: {book.isbn}</p>
            {book.bookId && <p className="text-xs text-muted-foreground font-mono">Book ID: {book.bookId}</p>}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <section>
        <h2 className="font-display text-2xl text-foreground mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-accent" /> Reviews &amp; Discussion
        </h2>

        {/* Write Review */}
        <div className="bg-card rounded-xl border border-border p-5 shadow-card mb-6">
          <h3 className="font-semibold text-card-foreground mb-3">Write a Review</h3>

          {/* Star picker */}
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

          {/* Validation / success messages */}
          {submitError && (
            <p className="text-destructive text-xs mt-1.5">{submitError}</p>
          )}
          {submitSuccess && (
            <p className="text-success text-xs mt-1.5">{submitSuccess}</p>
          )}

          <button
            onClick={handleSubmitReview}
            disabled={submitting}
            className="btn-gold mt-3 disabled:opacity-60"
          >
            {submitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</>
            ) : (
              <><Send className="w-4 h-4" /> Submit Review</>
            )}
          </button>
        </div>

        {/* Existing Reviews */}
        <div className="space-y-4">
          {loadingReviews ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
            </div>
          ) : reviews.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No reviews yet. Be the first!</p>
          ) : (
            reviews.map((review, i) => (
              <motion.div
                key={review._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.04 }}
                className="bg-card rounded-xl border border-border p-5 shadow-card"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center text-xs font-bold text-accent-foreground">
                    {review.userName?.split(' ').map((n: string) => n[0]).join('') || '?'}
                  </div>
                  <div>
                    <p className="font-medium text-card-foreground">{review.userName}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div className="flex gap-0.5 mb-2">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star key={s} className={`w-4 h-4 ${s <= review.rating ? 'text-gold fill-gold' : 'text-muted'}`} />
                  ))}
                </div>
                <p className="text-foreground/80 text-sm leading-relaxed">{review.content}</p>
                <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="w-4 h-4" /> {review.likes}
                  </span>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </section>
      {/* Barcode Scanner Modal Modal Overlay */}
      {showScanner && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md relative"
          >
            <BarcodeScanner 
              onSuccess={handleScannerSuccess} 
              onError={(err) => setActionError(err)} 
              onClose={() => setShowScanner(false)}
            />
          </motion.div>
        </div>,
        document.body
      )}
    </div>
  );
}
