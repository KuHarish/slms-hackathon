import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import {
  BookOpen, Clock, AlertTriangle, TrendingUp,
  Star, ArrowRight, Coins, Bell, Library, BookCheck, BookX
} from 'lucide-react';
// Global library catalog — used only for library-wide Overview stats
import { books, borrowRecords, calculateFine } from '@/data/mockData';
import BookCard from '@/components/BookCard';

// Framer Motion stagger variants
const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function Dashboard() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      const token = localStorage.getItem('token');
      fetch('https://bookhive-95y5.onrender.com/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => setNotifications(data))
      .catch(console.error);
    }
  }, [user]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // ── User-specific stats ───────────────────────────────────────────────────
  // totalBorrowedCount is the counter stored in MongoDB, incremented by the
  // borrow API whenever a book is issued. Use as primary source.
  // booksBorrowed.length is a secondary fallback.
  const myBorrowedCount = user?.totalBorrowedCount
    || (user as any)?.booksBorrowed?.length
    || 0;
  const myOverdueCount = (user as any)?.overdueBooksCount ?? 0;
  const myTokens       = user?.tokens ?? 0;

  // Active Borrows list — prefer real DB data (booksBorrowed populated from MongoDB);
  // fall back to mockData borrowRecords while a borrow-recording API doesn't exist yet.
  const dbBorrows: any[] = (user as any)?.booksBorrowed ?? [];
  const mockActiveBorrows = borrowRecords
    .filter(r => r.status !== 'returned')
    .map(r => ({
      ...r,
      book: books.find(b => b.id === r.bookId),
      fine: r.status === 'overdue' ? calculateFine(r.dueDate) : 0,
    }));
  const activeBorrows = dbBorrows.length > 0 ? dbBorrows : mockActiveBorrows;

  // ── Library-wide Overview stats (same for all users — shows library health) ──
  const totalBooks      = books.length;
  const totalAvailable  = books.reduce((sum, b) => sum + b.availableCopies, 0);
  const totalIssued     = books.reduce((sum, b) => sum + (b.totalCopies - b.availableCopies), 0);

  const libraryStatCards = [
    { label: 'Total Books',      value: totalBooks,     icon: Library,    iconBg: 'bg-primary/10 text-primary',         gradient: 'from-primary/10 to-primary/5 border-primary/20'     },
    { label: 'Books Issued',     value: totalIssued,    icon: BookCheck,  iconBg: 'bg-info/10 text-info',               gradient: 'from-info/10 to-info/5 border-info/20'               },
    { label: 'Available Copies', value: totalAvailable, icon: BookOpen,   iconBg: 'bg-success/10 text-success',         gradient: 'from-success/10 to-success/5 border-success/20'     },
    { label: 'Overdue (Est.)',   value: 0,              icon: BookX,      iconBg: 'bg-destructive/10 text-destructive', gradient: 'from-destructive/10 to-destructive/5 border-destructive/20' },
  ];

  // ── Personal Activity cards (100% user-specific from JWT-verified user doc) ──
  const personalStatCards = [
    { label: 'Books Borrowed', value: myBorrowedCount, icon: BookOpen,      iconBg: 'bg-primary/10 text-primary'          },
    { label: 'Overdue Items',  value: myOverdueCount,  icon: AlertTriangle, iconBg: 'bg-destructive/10 text-destructive'  },
    { label: 'My Tokens',      value: myTokens,         icon: Coins,         iconBg: 'bg-accent/20 text-accent-foreground' },
    { label: 'Unread Alerts',  value: unreadCount,      icon: Bell,          iconBg: 'bg-info/10 text-info'                },
  ];

  const trendingBooks = [...books].sort((a, b) => b.rating - a.rating).slice(0, 4);

  return (
    <div className="space-y-8">
      {/* ── Header Greeting ──────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-end justify-between gap-4"
      >
        <div>
          <h1 className="font-display text-3xl lg:text-4xl text-foreground">
            Welcome back, <span className="text-accent">{user?.name?.split(' ')[0] || 'Guest'}</span>
          </h1>
          <p className="text-muted-foreground mt-1.5 text-sm">Here's your library activity summary for today.</p>
        </div>
      </motion.div>

      {/* ── Library Overview (global stats) — admin only ──────── */}
      {user?.role === 'admin' && (
        <section>
          <h2 className="font-display text-lg text-foreground mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-accent" />
            Library Overview
          </h2>
          <motion.div
            className="grid grid-cols-2 lg:grid-cols-4 gap-4"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {libraryStatCards.map(stat => (
              <motion.div
                key={stat.label}
                variants={cardVariants}
                className={`relative bg-gradient-to-br ${stat.gradient} rounded-2xl border p-5 overflow-hidden`}
              >
                <div className="absolute -bottom-3 -right-3 w-16 h-16 rounded-full bg-current opacity-5" />
                <div className={`w-9 h-9 rounded-xl ${stat.iconBg} flex items-center justify-center mb-3`}>
                  <stat.icon className="w-4 h-4" />
                </div>
                <p className="text-2xl font-bold text-card-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>
      )}

      {/* ── My Activity (user-specific stats) ────────────────── */}
      <section>
        <h2 className="font-display text-lg text-foreground mb-3">My Activity</h2>
        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {personalStatCards.map(stat => (
            <motion.div
              key={stat.label}
              variants={cardVariants}
              className="bg-card rounded-2xl border border-border p-5 shadow-card"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-9 h-9 rounded-xl ${stat.iconBg} flex items-center justify-center`}>
                  <stat.icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-card-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── Active Borrows ────────────────────────────────────── */}
      {/* Fix #1: Renders books from the user's booksBorrowed array (from MongoDB) */}
      {/* A new user with no books will see the empty state — Fix #2 */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl text-foreground">Active Borrows</h2>
          <Link to="/profile" className="text-sm text-accent hover:underline flex items-center gap-1 font-medium">
            View history <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-card">
          {activeBorrows.length === 0 ? (
            <div className="p-10 text-center">
              <BookOpen className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No active borrows</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {activeBorrows.map((borrow: any, i: number) => {
                // Handle both DB shape (borrow.title) and mockData shape (borrow.book.title)
                const title    = borrow.title    || borrow.book?.title    || 'Unknown Book';
                const author   = borrow.author   || borrow.book?.author   || '';
                const coverUrl = borrow.coverUrl || borrow.book?.coverUrl || '';
                const bookId   = borrow._id      || borrow.bookId         || borrow.id;
                const dueDate  = borrow.dueDate;
                const status   = borrow.status   || 'active';
                const fine     = borrow.fine      || 0;
                return (
                  <motion.div
                    key={borrow._id || borrow.id || i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="p-4 lg:px-6 flex items-center gap-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="w-10 h-14 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {coverUrl ? (
                        <img src={coverUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <BookOpen className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/books/${bookId}`}
                        className="font-medium text-sm text-card-foreground hover:text-accent transition-colors line-clamp-1"
                      >
                        {title}
                      </Link>
                      <p className="text-xs text-muted-foreground mt-0.5">{author}</p>
                    </div>
                    <div className="text-right flex-shrink-0 space-y-1">
                      {dueDate && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground justify-end">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Due {new Date(dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        </div>
                      )}
                      {fine > 0 && (
                        <span className="text-destructive text-xs font-medium flex items-center gap-1 justify-end">
                          <AlertTriangle className="w-3 h-3" />₹{fine.toFixed(2)} fine
                        </span>
                      )}
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold flex-shrink-0 ${
                      status === 'overdue'
                        ? 'bg-destructive/10 text-destructive'
                        : 'bg-success/10 text-success'
                    }`}>
                      {status}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── Notifications ─────────────────────────────────────── */}
      <section>
        <h2 className="font-display text-xl text-foreground mb-4">Recent Notifications</h2>
        <div className="space-y-2.5">
          {notifications.length === 0 ? (
            <div className="bg-card rounded-2xl border border-border p-8 shadow-card text-center">
              <Bell className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No recent notifications</p>
            </div>
          ) : (
            notifications.slice(0, 3).map((notif, i) => (
              <motion.div
                key={notif._id || notif.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`bg-card rounded-2xl border p-4 shadow-card flex items-start gap-3 hover:shadow-elevated transition-all duration-200 ${
                  !notif.isRead ? 'border-accent/40' : 'border-border'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  notif.type === 'error'   ? 'bg-destructive/10 text-destructive' :
                  notif.type === 'warning' ? 'bg-warning/10 text-warning' :
                  notif.type === 'success' ? 'bg-success/10 text-success' : 'bg-info/10 text-info'
                }`}>
                  <Bell className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-card-foreground">{notif.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{notif.message}</p>
                </div>
                {!notif.isRead && <div className="w-2 h-2 rounded-full bg-accent flex-shrink-0 mt-1.5" />}
              </motion.div>
            ))
          )}
        </div>
      </section>

      {/* ── Top Rated Books ───────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl text-foreground flex items-center gap-2">
            <Star className="w-5 h-5 text-accent fill-accent" /> Top Rated
          </h2>
          <Link to="/books" className="text-sm text-accent hover:underline flex items-center gap-1 font-medium">
            Browse all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {trendingBooks.map(book => (
            <motion.div key={book.id} variants={cardVariants}>
              <BookCard book={book} />
            </motion.div>
          ))}
        </motion.div>
      </section>
    </div>
  );
}
