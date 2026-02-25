import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookMarked, LogIn, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { currentUser, librarianUser, adminUser, badges } from '@/data/mockData';
import type { User } from '@/types/library';

const mockAccounts = [
  { user: currentUser, password: 'student123', hint: 'Student account' },
  { user: librarianUser, password: 'librarian123', hint: 'Librarian account' },
  { user: adminUser, password: 'admin123', hint: 'Admin account' },
];

type Mode = 'login' | 'signup';

export default function Login() {
  const { login } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setConfirmPassword('');
    setError('');
  };

  const switchMode = (m: Mode) => {
    resetForm();
    setMode(m);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (trimmedName.length < 2) {
      setError('Name must be at least 2 characters.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (mockAccounts.some(a => a.user.email === trimmedEmail)) {
      setError('An account with this email already exists.');
      return;
    }

    setLoading(true);
    await new Promise(r => setTimeout(r, 800));

    const newUser: User = {
      id: `u_${Date.now()}`,
      name: trimmedName,
      email: trimmedEmail,
      role: 'student',
      avatarUrl: '',
      tokens: 0,
      badges: [],
      joinedAt: new Date().toISOString().split('T')[0],
      borrowCount: 0,
    };

    login(newUser);
    setLoading(false);
  };

  const quickLogin = (account: typeof mockAccounts[0]) => {
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
          <p className="text-sm text-muted-foreground">
            {mode === 'login' ? 'Sign in to your account' : 'Create a new student account'}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {mode === 'login' ? (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* Login Form */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Sign In</CardTitle>
                  <CardDescription>Enter your credentials to access the library</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="you@university.edu"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <Input
                        id="login-password"
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

                    <p className="text-center text-sm text-muted-foreground">
                      Don't have an account?{' '}
                      <button
                        type="button"
                        onClick={() => switchMode('signup')}
                        className="text-primary font-medium hover:underline"
                      >
                        Sign up
                      </button>
                    </p>
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
          ) : (
            <motion.div
              key="signup"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              {/* Signup Form */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Create Account</CardTitle>
                  <CardDescription>Register as a new student to start borrowing books</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Full Name</Label>
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="Jane Doe"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        maxLength={100}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">University Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="you@university.edu"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        maxLength={255}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="At least 6 characters"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        minLength={6}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-confirm">Confirm Password</Label>
                      <Input
                        id="signup-confirm"
                        type="password"
                        placeholder="Re-enter your password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>

                    {error && (
                      <div className="flex items-center gap-2 text-sm text-destructive">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        {error}
                      </div>
                    )}

                    <div className="rounded-lg bg-muted/50 border border-border p-3 space-y-1.5">
                      <p className="text-xs font-medium text-muted-foreground">New accounts include:</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                        Student role with full catalog access
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                        Borrow up to 5 books at a time
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                        Earn tokens & badges through activity
                      </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                      <UserPlus className="w-4 h-4" />
                      {loading ? 'Creating account...' : 'Create Account'}
                    </Button>

                    <p className="text-center text-sm text-muted-foreground">
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => switchMode('login')}
                        className="text-primary font-medium hover:underline"
                      >
                        Sign in
                      </button>
                    </p>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
