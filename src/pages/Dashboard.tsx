import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import {
  BookOpen, Clock, AlertTriangle, TrendingUp,
  Star, ArrowRight, Coins, Bell
} from 'lucide-react';
import { books, borrowRecords, calculateFine } from '@/data/mockData';
import BookCard from '@/components/BookCard';

const statCards = [
  {
    label: 'Books Borrowed',
    value: borrowRecords.filter(r => r.status !== 'returned').length,
    total: 0, // This will be updated dynamically
    icon: BookOpen,
    color: 'bg-primary text-primary-foreground',
  },
  {
    label: 'Overdue',
    value: borrowRecords.filter(r => r.status === 'overdue').length,
    icon: AlertTriangle,
    color: 'bg-destructive text-destructive-foreground',
  },
  {
    label: 'Tokens',
    value: 0, // This will be updated dynamically
    icon: Coins,
    color: 'gradient-gold text-primary',
  },
  {
    label: 'Unread Alerts',
    value: 0, // This will be updated dynamically
    icon: Bell,
    color: 'bg-info text-info-foreground',
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

  // Update statCards with user data
  statCards[0].total = user?.borrowCount || 0;
  statCards[2].value = user?.tokens || 0;
  statCards[3].value = notifications.filter(n => !n.isRead).length;

  const activeRecords = borrowRecords
    .filter(r => r.status !== 'returned')
    .map(r => ({
      ...r,
      book: books.find(b => b.id === r.bookId),
      fine: r.status === 'overdue' ? calculateFine(r.dueDate) : 0,
    }));

  const trendingBooks = [...books].sort((a, b) => b.rating - a.rating).slice(0, 4);

  return (
    <div className="space-y-8">
      {/* Header Greeting */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl lg:text-4xl text-foreground">
            Welcome back, {user?.name?.split(' ')[0] || 'Guest'}
          </h1>
          <p className="text-muted-foreground mt-1">Here's your library activity summary for today.</p>
        </div>
        <div className="hidden sm:flex items-center gap-2"></div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-card rounded-xl border border-border p-5 shadow-card"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-bold text-card-foreground">{stat.value}</p>
            <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Active Borrows */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl text-foreground">Active Borrows</h2>
          <Link to="/profile" className="text-sm text-accent hover:underline flex items-center gap-1">
            View history <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="bg-card rounded-xl border border-border overflow-hidden shadow-card">
          {activeRecords.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No active borrows</div>
          ) : (
            <div className="divide-y divide-border">
              {activeRecords.map(record => (
                <div key={record.id} className="p-4 lg:px-6 flex items-center gap-4">
                  <div className="w-10 h-14 rounded bg-muted flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link to={`/books/${record.bookId}`} className="font-medium text-card-foreground hover:text-accent transition-colors">
                      {record.book?.title}
                    </Link>
                    <p className="text-sm text-muted-foreground">{record.book?.author}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="flex items-center gap-1.5 text-sm">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Due {new Date(record.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>
                    {record.fine > 0 && (
                      <span className="text-destructive font-medium ml-3 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        ₹{record.fine.toFixed(2)} fine
                      </span>
                    )}
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    record.status === 'overdue'
                      ? 'bg-destructive/10 text-destructive'
                      : 'bg-success/10 text-success'
                  }`}>
                    {record.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Notifications */}
      <section>
        <h2 className="font-display text-xl text-foreground mb-4">Recent Notifications</h2>
        <div className="space-y-3">
          {notifications.length === 0 ? (
            <div className="bg-card rounded-xl border border-border p-6 shadow-card text-center text-muted-foreground">
              No recent notifications
            </div>
          ) : (
            notifications.slice(0, 3).map((notif, i) => (
              <motion.div
                key={notif._id || notif.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`bg-card rounded-xl border p-4 shadow-card flex items-start gap-3 ${
                  !notif.isRead ? 'border-accent' : 'border-border'
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
                  <p className="font-medium text-sm text-card-foreground">{notif.title}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{notif.message}</p>
                </div>
                {!notif.isRead && (
                  <div className="w-2 h-2 rounded-full bg-accent flex-shrink-0 mt-2" />
                )}
              </motion.div>
            ))
          )}
        </div>
      </section>

      {/* Trending */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl text-foreground flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-accent" /> Top Rated
          </h2>
          <Link to="/books" className="text-sm text-accent hover:underline flex items-center gap-1">
            Browse all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {trendingBooks.map(book => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </section>
    </div>
  );
}
