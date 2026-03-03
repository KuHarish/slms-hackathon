import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  Coins, Award, BookOpen, Clock, ArrowUpRight, ArrowDownRight,
  CheckCircle, AlertTriangle, Send, LogOut
} from 'lucide-react';
import { books, borrowRecords, tokenTransactions, bookRequests, badges, calculateFine } from '@/data/mockData';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { STATUS_COLORS } from '@/lib/colors';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'history' | 'tokens' | 'requests'>('history');

  // Fix #4: Sign-out handler — clears token and redirects to login
  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  // Fallback to empty array if user or booksBorrowed is missing
  const activeBooksBorrowed = user?.booksBorrowed || [];

  const history = borrowRecords.map(r => ({
    ...r,
    book: books.find(b => b.id === r.bookId),
    fine: r.status === 'overdue' ? calculateFine(r.dueDate) : r.fine,
  }));

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-xl border border-border p-6 shadow-card"
      >
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-full gradient-gold flex items-center justify-center text-xl font-bold text-primary">
            {user?.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
          </div>
          <div className="flex-1">
            <h1 className="font-display text-2xl text-card-foreground flex items-center gap-3">
              {user?.name || 'User Name'}
              {(user?.badges || []).map((b: any, index: number) => (
                <span key={index} className="text-sm px-2 py-0.5 rounded-full bg-accent/20 text-accent-foreground" title={b.description || ''}>
                  {b.icon} {b.name}
                </span>
              ))}
            </h1>
            <p className="text-muted-foreground">{user?.email || ''} · {user?.role || 'user'}</p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <div className="text-right">
              <div className="flex items-center gap-2 text-2xl font-bold text-gold">
                <Coins className="w-6 h-6" />
                {user?.tokens || 0}
              </div>
              <p className="text-xs text-muted-foreground">reward tokens</p>
            </div>
            {/* Sign Out — uses btn-danger-outline from design system */}
            <button onClick={handleSignOut} className="btn-danger-outline">
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-4 text-center border-t border-border pt-5">
          <div>
            <p className="text-xl font-bold text-card-foreground">{user?.totalBorrowedCount || 0}</p>
            <p className="text-xs text-muted-foreground">Books Borrowed</p>
          </div>
          <div>
            <p className="text-xl font-bold text-card-foreground">{user?.badges?.length || 0}</p>
            <p className="text-xs text-muted-foreground">Badges</p>
          </div>
          <div>
            <p className="text-xl font-bold text-card-foreground">{user?.joinedAt ? new Date(user.joinedAt).getFullYear() : new Date().getFullYear()}</p>
            <p className="text-xs text-muted-foreground">Member Since</p>
          </div>
        </div>
      </motion.div>

      {/* Badge Progress */}
      <div className="bg-card rounded-xl border border-border p-6 shadow-card">
        <h2 className="font-display text-lg text-card-foreground mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-accent" /> Badge Progress
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {badges.map(badge => {
            const earned = (user?.tokens || 0) >= badge.requiredTokens;
            const progress = Math.min(((user?.tokens || 0) / badge.requiredTokens) * 100, 100);
            return (
              <div key={badge.id} className={`p-4 rounded-lg border text-center ${earned ? 'border-accent bg-accent/5' : 'border-border'}`}>
                <span className="text-2xl">{badge.icon}</span>
                <p className="text-sm font-medium text-card-foreground mt-2">{badge.name}</p>
                <p className="text-xs text-muted-foreground">{badge.requiredTokens} tokens</p>
                <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full gradient-gold rounded-full transition-all" style={{ width: `${progress}%` }} />
                </div>
                {earned && <p className="text-xs text-accent font-medium mt-1">Earned!</p>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted rounded-lg p-1">
        {(['history', 'tokens', 'requests'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-colors capitalize ${
              tab === t ? 'bg-card text-card-foreground shadow-card' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t === 'history' ? 'Borrow History' : t === 'tokens' ? 'Token History' : 'Book Requests'}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'history' && (
        <div className="bg-card rounded-xl border border-border overflow-hidden shadow-card">
          <div className="divide-y divide-border">
            {history.map(record => (
              <div key={record.id} className="p-4 lg:px-6 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  record.status === 'returned' ? 'bg-success/10' : record.status === 'overdue' ? 'bg-destructive/10' : 'bg-accent/10'
                }`}>
                  {record.status === 'returned' ? <CheckCircle className="w-5 h-5 text-success" /> :
                   record.status === 'overdue' ? <AlertTriangle className="w-5 h-5 text-destructive" /> :
                   <Clock className="w-5 h-5 text-accent" />}
                </div>
                <div className="flex-1 min-w-0">
                  <Link to={`/books/${record.bookId}`} className="font-medium text-card-foreground hover:text-accent transition-colors">
                    {record.book?.title}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    Borrowed {new Date(record.borrowedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    {record.returnedAt && ` · Returned ${new Date(record.returnedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                  </p>
                </div>
                <div className="text-right">
                  {record.fine > 0 && (
                    <p className="text-sm text-destructive font-semibold">₹{record.fine.toFixed(2)} fine</p>
                  )}
                  {/* Use STATUS_COLORS token map instead of hardcoded conditionals */}
                  <span className={STATUS_COLORS[record.status as keyof typeof STATUS_COLORS]?.badge || 'badge-muted'}>
                    {record.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'tokens' && (
        <div className="bg-card rounded-xl border border-border overflow-hidden shadow-card">
          <div className="divide-y divide-border">
            {tokenTransactions.map(tx => (
              <div key={tx.id} className="p-4 lg:px-6 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  tx.type === 'earned' ? 'bg-success/10' : 'bg-destructive/10'
                }`}>
                  {tx.type === 'earned' ? <ArrowUpRight className="w-5 h-5 text-success" /> : <ArrowDownRight className="w-5 h-5 text-destructive" />}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-card-foreground">{tx.reason}</p>
                  <p className="text-xs text-muted-foreground">{new Date(tx.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                </div>
                <span className={`font-bold text-lg ${tx.type === 'earned' ? 'text-success' : 'text-destructive'}`}>
                  {tx.type === 'earned' ? '+' : ''}{tx.amount}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'requests' && (
        <div className="bg-card rounded-xl border border-border overflow-hidden shadow-card">
          <div className="divide-y divide-border">
            {bookRequests.map(req => (
              <div key={req.id} className="p-4 lg:px-6 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Send className="w-5 h-5 text-accent" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-card-foreground">{req.title} <span className="text-muted-foreground font-normal">by {req.author}</span></p>
                  <p className="text-sm text-muted-foreground">{req.reason}</p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  req.status === 'approved' ? 'bg-success/10 text-success' :
                  req.status === 'rejected' ? 'bg-destructive/10 text-destructive' :
                  'bg-warning/10 text-warning'
                }`}>
                  {req.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
