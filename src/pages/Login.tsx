import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookMarked, LogIn, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { currentUser, librarianUser, adminUser } from '@/data/mockData';

const mockAccounts = [
  { user: currentUser, password: 'student123', hint: 'Student account' },
  { user: librarianUser, password: 'librarian123', hint: 'Librarian account' },
  { user: adminUser, password: 'admin123', hint: 'Admin account' },
];

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate network delay
    await new Promise(r => setTimeout(r, 600));

    const account = mockAccounts.find(
      a => a.user.email === email.trim().toLowerCase() && a.password === password
    );

    if (account) {
      login(account.user);
    } else {
      setError('Invalid email or password. Try one of the demo accounts below.');
    }
    setLoading(false);
  };

  const quickLogin = (account: typeof mockAccounts[0]) => {
    setEmail(account.user.email);
    setPassword(account.password);
    login(account.user);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md space-y-6"
      >
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-xl gradient-gold flex items-center justify-center mx-auto">
            <BookMarked className="w-7 h-7 text-primary" />
          </div>
          <h1 className="font-display text-2xl text-foreground">Community Library</h1>
          <p className="text-sm text-muted-foreground">Sign in to your account</p>
        </div>

        {/* Login Form */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Sign In</CardTitle>
            <CardDescription>Enter your credentials to access the library</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@university.edu"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                <LogIn className="w-4 h-4" />
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Quick Login */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Demo Accounts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {mockAccounts.map(account => (
              <button
                key={account.user.id}
                onClick={() => quickLogin(account)}
                className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors text-left"
              >
                <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center text-xs font-semibold text-accent-foreground">
                  {account.user.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{account.user.name}</p>
                  <p className="text-xs text-muted-foreground">{account.hint} · {account.user.email}</p>
                </div>
                <span className="text-xs capitalize px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                  {account.user.role}
                </span>
              </button>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
