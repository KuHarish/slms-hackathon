import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  Coins, Award, BookOpen, Clock, ArrowUpRight, ArrowDownRight,
  CheckCircle, AlertTriangle, Send, LogOut, Loader2
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { STATUS_COLORS } from '@/lib/colors';

import { API_URL } from '@/config';
const API = API_URL;

const badges = [
  { id: 'b1', name: 'Bookworm', description: 'Read 10 books', icon: '🐛', requiredTokens: 100 },
  { id: 'b2', name: 'Scholar', description: 'Read 50 books', icon: '🎓', requiredTokens: 500 },
  { id: 'b3', name: 'Library Legend', description: 'Read 100 books', icon: '👑', requiredTokens: 1000 },
];

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'history' | 'tokens' | 'requests'>('history');

  // Fix #4: Sign-out handler — clears token and redirects to login
  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  const [history, setHistory] = useState<any[]>([]);
  const [tokenTransactions] = useState<any[]>([]);
  const [bookRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const token = localStorage.getItem('token');
      fetch(`${API}/transactions`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          // Filter transactions for current user id
          const myId = user._id || user.id;
          const myTx = data.filter(t => (t.user_id?._id || t.user_id) === myId || (t.user?._id || t.user) === myId);
          setHistory(myTx);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-xl border border-border p-6 shadow-card"
      >
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-full gradient-gold flex items-center justify-center text-xl font-bold text-primary-foreground">
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
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
              </div>
            ) : history.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No history found.</p>
            ) : (
              history.map(record => {
                const title = record.book_id?.title || record.book?.title || 'Unknown Book';
                const status = record.status || 'active';
                const fine = record.fine || 0;
                
                return (
                  <div key={record._id || record.id} className="p-4 lg:px-6 flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      status === 'returned' ? 'bg-success/10' : status === 'overdue' ? 'bg-destructive/10' : 'bg-accent/10'
                    }`}>
                      {status === 'returned' ? <CheckCircle className="w-5 h-5 text-success" /> :
                      status === 'overdue' ? <AlertTriangle className="w-5 h-5 text-destructive" /> :
                      <Clock className="w-5 h-5 text-accent" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link to={`/books/${record.book_id?._id || record.book?._id || record.book_id || record.book}`} className="font-medium text-card-foreground hover:text-accent transition-colors">
                        {title}
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        Borrowed {new Date(record.checkout_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        {record.return_date && ` · Returned ${new Date(record.return_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                      </p>
                    </div>
                    <div className="text-right">
                      {fine > 0 && (
                        <p className="text-sm text-destructive font-semibold">₹{fine.toFixed(2)} fine</p>
                      )}
                      <span className={STATUS_COLORS[status as keyof typeof STATUS_COLORS]?.badge || 'badge-muted'}>
                        {status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
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
