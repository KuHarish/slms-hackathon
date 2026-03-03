import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import {
  BookOpen, Clock, AlertTriangle, TrendingUp,
  Star, ArrowRight, Coins, Bell, Library, BookCheck, BookX
} from 'lucide-react';
import { books, borrowRecords, calculateFine } from '@/data/mockData';
import BookCard from '@/components/BookCard';

// ── Library summary stat cards (for the overview section) ──────────
const libraryStats = [
  {
    label: 'Total Books',
    getValue: () => books.length,
    icon: Library,
    color: 'from-primary/10 to-primary/5 text-primary border-primary/20',
    iconBg: 'bg-primary/10 text-primary',
  },
  {
    label: 'Books Issued',
    getValue: () => borrowRecords.filter(r => r.status !== 'returned').length,
    icon: BookCheck,
    color: 'from-info/10 to-info/5 text-info border-info/20',
    iconBg: 'bg-info/10 text-info',
  },
  {
    label: 'Available Copies',
    getValue: () => books.reduce((sum, b) => sum + b.availableCopies, 0),
    icon: BookOpen,
    color: 'from-success/10 to-success/5 text-success border-success/20',
    iconBg: 'bg-success/10 text-success',
  },
  {
    label: 'Overdue',
    getValue: () => borrowRecords.filter(r => r.status === 'overdue').length,
    icon: BookX,
    color: 'from-destructive/10 to-destructive/5 text-destructive border-destructive/20',
    iconBg: 'bg-destructive/10 text-destructive',
  },
];

// ── Personal stat cards ────────────────────────────────────────────
const personalStatCards = [
  {
    label: 'Books Borrowed',
    icon: BookOpen,
    iconBg: 'bg-primary/10 text-primary',
    getValue: (_user: any, _notifs: number, activeCount: number) => activeCount,
  },
  {
    label: 'Overdue Items',
    icon: AlertTriangle,
    iconBg: 'bg-destructive/10 text-destructive',
    getValue: (_user: any, _notifs: number, _active: number, overdueCount: number) => overdueCount,
  },
  {
    label: 'My Tokens',
    icon: Coins,
    iconBg: 'bg-accent/20 text-accent-foreground',
    getValue: (user: any) => user?.tokens || 0,
  },
  {
    label: 'Unread Alerts',
    icon: Bell,
    iconBg: 'bg-info/10 text-info',
    getValue: (_user: any, notifs: number) => notifs,
  },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      const token = localStorage.getItem('token');
      fetch('http://localhost:3000/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => setNotifications(data))
      .catch(console.error);
    }
  }, [user]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const activeRecords = borrowRecords
    .filter(r => r.status !== 'returned')
    .map(r => ({
      ...r,
      book: books.find(b => b.id === r.bookId),
      fine: r.status === 'overdue' ? calculateFine(r.dueDate) : 0,
    }));

  const trendingBooks = [...books].sort((a, b) => b.rating - a.rating).slice(0, 4);

  // Framer Motion stagger container
  const containerVariants = {
    hidden: {},
    show: {
      transition: { staggerChildren: 0.08 },
    },
  };
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  };

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

      {/* ── Library Overview (4 summary cards) ────────────────── */}
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
          {libraryStats.map(stat => (
            <motion.div
              key={stat.label}
              variants={cardVariants}
              className={`relative bg-gradient-to-br ${stat.color} rounded-2xl border p-5 overflow-hidden`}
            >
              {/* Decorative background circle */}
              <div className="absolute -bottom-3 -right-3 w-16 h-16 rounded-full bg-current opacity-5" />
              <div className={`w-9 h-9 rounded-xl ${stat.iconBg} flex items-center justify-center mb-3 flex-shrink-0`}>
                <stat.icon className="w-4.5 h-4.5" />
              </div>
              <p className="text-2xl font-bold text-card-foreground">{stat.getValue()}</p>
              <p className="text-xs text-muted-foreground mt-1 font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── Personal Stats ────────────────────────────────────── */}
      <section>
        <h2 className="font-display text-lg text-foreground mb-3">My Activity</h2>
        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {personalStatCards.map((stat) => {
            const activeCount = borrowRecords.filter(r => r.status !== 'returned').length;
            const overdueCount = borrowRecords.filter(r => r.status === 'overdue').length;
            const value = stat.getValue(user, unreadCount, activeCount, overdueCount);
            return (
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
                <p className="text-2xl font-bold text-card-foreground">{value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* ── Active Borrows ────────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl text-foreground">Active Borrows</h2>
          <Link to="/profile" className="text-sm text-accent hover:underline flex items-center gap-1 font-medium">
            View history <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-card">
          {activeRecords.length === 0 ? (
            <div className="p-10 text-center">
              <BookOpen className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No active borrows</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {activeRecords.map((record, i) => (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="p-4 lg:px-6 flex items-center gap-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="w-10 h-14 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {record.book?.coverUrl ? (
                      <img src={record.book.coverUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <BookOpen className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link to={`/books/${record.bookId}`} className="font-medium text-sm text-card-foreground hover:text-accent transition-colors line-clamp-1">
                      {record.book?.title}
                    </Link>
                    <p className="text-xs text-muted-foreground mt-0.5">{record.book?.author}</p>
                  </div>
                  <div className="text-right flex-shrink-0 space-y-1">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground justify-end">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Due {new Date(record.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>
                    {record.fine > 0 && (
                      <span className="text-destructive text-xs font-medium flex items-center gap-1 justify-end">
                        <AlertTriangle className="w-3 h-3" />
                        ₹{record.fine.toFixed(2)} fine
                      </span>
                    )}
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold flex-shrink-0 ${
                    record.status === 'overdue'
                      ? 'bg-destructive/10 text-destructive'
                      : 'bg-success/10 text-success'
                  }`}>
                    {record.status}
                  </span>
                </motion.div>
              ))}
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
                  notif.type === 'error' ? 'bg-destructive/10 text-destructive' :
                  notif.type === 'warning' ? 'bg-warning/10 text-warning' :
                  notif.type === 'success' ? 'bg-success/10 text-success' : 'bg-info/10 text-info'
                }`}>
                  <Bell className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-card-foreground">{notif.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{notif.message}</p>
                </div>
                {!notif.isRead && (
                  <div className="w-2 h-2 rounded-full bg-accent flex-shrink-0 mt-1.5" />
                )}
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
