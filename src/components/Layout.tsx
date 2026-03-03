import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, BookOpen, User, Users, Bell, 
  Menu, X, BookMarked, LogOut, Sun, Moon, Crown
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const allNavItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['user', 'admin'] as const },
  { path: '/books', label: 'Catalog', icon: BookOpen, roles: ['user', 'admin'] as const },
  { path: '/community', label: 'Community', icon: Users, roles: ['user', 'admin'] as const },
  { path: '/profile', label: 'Profile', icon: User, roles: ['user', 'admin'] as const },
  { path: '/admin', label: 'Admin', icon: Crown, roles: ['admin'] as const },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const navItems = allNavItems.filter(item => user && (item.roles as readonly string[]).includes(user.role));

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

  // Detect scroll on main content to apply glass effect on header
  useEffect(() => {
    const mainEl = document.getElementById('main-content');
    if (!mainEl) return;
    const handleScroll = () => setScrolled(mainEl.scrollTop > 10);
    mainEl.addEventListener('scroll', handleScroll, { passive: true });
    return () => mainEl.removeEventListener('scroll', handleScroll);
  }, []);

  // Close notifications panel on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifs(false);
      }
    };
    if (showNotifs) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showNotifs]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const toggleDark = () => {
    setDark(!dark);
    document.documentElement.classList.toggle('dark');
  };

  // Shared sidebar navigation link renderer
  const SidebarNavLink = ({ item, onClick }: { item: typeof navItems[0]; onClick?: () => void }) => {
    const active = location.pathname === item.path;
    return (
      <Link
        key={item.path}
        to={item.path}
        onClick={onClick}
        className={`group relative flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
          active
            ? 'bg-sidebar-accent text-sidebar-primary shadow-sm'
            : 'text-sidebar-foreground/65 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground'
        }`}
      >
        {/* Active indicator bar */}
        {active && (
          <motion.span
            layoutId="activeNav"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-sidebar-primary"
          />
        )}
        <item.icon className={`w-4.5 h-4.5 flex-shrink-0 ${active ? 'text-sidebar-primary' : 'text-sidebar-foreground/50 group-hover:text-sidebar-foreground'}`} />
        <span className={active ? 'font-semibold' : ''}>{item.label}</span>
        {item.path === '/' && unreadCount > 0 && (
          <span className="ml-auto bg-destructive text-destructive-foreground text-[10px] rounded-full w-4.5 h-4.5 flex items-center justify-center font-bold">
            {unreadCount}
          </span>
        )}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* ── Desktop Sidebar ─────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-64 bg-sidebar border-r border-sidebar-border flex-shrink-0">
        {/* Logo */}
        <div className="p-5 pb-4">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl gradient-gold flex items-center justify-center shadow-glow flex-shrink-0">
              <BookMarked className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-lg text-sidebar-foreground leading-tight tracking-tight">Book Hive</h1>
              <p className="text-[11px] text-sidebar-foreground/50 tracking-wide uppercase font-medium">Library</p>
            </div>
          </Link>
        </div>

        {/* Divider */}
        <div className="mx-4 h-px bg-sidebar-border mb-2" />

        {/* Nav */}
        <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
          {navItems.map(item => (
            <SidebarNavLink key={item.path} item={item} />
          ))}
        </nav>

        {/* User Footer */}
        <div className="p-3 border-t border-sidebar-border space-y-2">
          {user && (
            <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-sidebar-accent/30">
              <div className="w-8 h-8 rounded-full gradient-gold flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                {user.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-sidebar-foreground truncate leading-tight">{user.name}</p>
                <p className="text-[11px] text-sidebar-foreground/50 capitalize">{user.role}</p>
              </div>
            </div>
          )}
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-sidebar-foreground/50 hover:bg-sidebar-accent/40 hover:text-destructive transition-all duration-200"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Mobile Overlay ───────────────────────────────────── */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-foreground/50 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="fixed left-0 top-0 bottom-0 w-64 bg-sidebar z-50 lg:hidden flex flex-col"
            >
              <div className="p-4 flex items-center justify-between border-b border-sidebar-border">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl gradient-gold flex items-center justify-center">
                    <BookMarked className="w-4 h-4 text-primary" />
                  </div>
                  <span className="font-display text-sidebar-foreground">Book Hive</span>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1.5 rounded-lg text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
                {navItems.map(item => (
                  <SidebarNavLink key={item.path} item={item} onClick={() => setSidebarOpen(false)} />
                ))}
              </nav>
              {/* Mobile user info */}
              {user && (
                <div className="p-3 border-t border-sidebar-border">
                  <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-sidebar-accent/30 mb-2">
                    <div className="w-8 h-8 rounded-full gradient-gold flex items-center justify-center text-xs font-bold text-primary">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-sidebar-foreground truncate">{user.name}</p>
                      <p className="text-[11px] text-sidebar-foreground/50 capitalize">{user.role}</p>
                    </div>
                  </div>
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-sidebar-foreground/50 hover:bg-sidebar-accent/40 hover:text-destructive transition-all duration-200"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main Content Area ────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky Top Bar with glass effect on scroll */}
        <header
          className={`sticky top-0 z-30 h-14 border-b flex items-center px-4 lg:px-6 gap-3 transition-all duration-300 ${
            scrolled
              ? 'glass border-border/80 shadow-card'
              : 'bg-card border-border'
          }`}
        >
          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Page breadcrumb / title — shows on mobile */}
          <div className="flex-1" />

          {/* Dark mode toggle */}
          <button
            onClick={toggleDark}
            className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            aria-label="Toggle theme"
          >
            {dark ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
          </button>

          {/* Notification bell */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifs(!showNotifs)}
              className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground relative"
              aria-label="Notifications"
            >
              <Bell className="w-4.5 h-4.5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-destructive text-destructive-foreground text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-bold leading-none">
                  {unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {showNotifs && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-2xl shadow-elevated z-50 overflow-hidden"
                >
                  <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
                    <h3 className="font-semibold text-sm text-foreground">Notifications</h3>
                    {unreadCount > 0 && (
                      <span className="text-xs text-accent cursor-pointer hover:underline font-medium">Mark all read</span>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto p-2">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-sm text-muted-foreground">
                        <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <div
                          key={notif._id || notif.id}
                          className={`p-3 rounded-xl mb-1 flex items-start gap-3 transition-colors cursor-pointer ${
                            !notif.isRead ? 'bg-accent/5 hover:bg-accent/10' : 'hover:bg-muted/50'
                          }`}
                        >
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                            notif.type === 'error' ? 'bg-destructive/10 text-destructive' :
                            notif.type === 'warning' ? 'bg-warning/10 text-warning' :
                            notif.type === 'success' ? 'bg-success/10 text-success' :
                            'bg-info/10 text-info'
                          }`}>
                            <Bell className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-foreground leading-snug">{notif.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{notif.message}</p>
                          </div>
                          {!notif.isRead && <div className="w-2 h-2 rounded-full bg-accent mt-1.5 shrink-0" />}
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User avatar */}
          <Link
            to="/profile"
            className="w-8 h-8 rounded-full gradient-gold flex items-center justify-center text-[11px] font-bold text-primary hover:shadow-glow transition-all duration-200"
          >
            {user.name.split(' ').map(n => n[0]).join('')}
          </Link>
        </header>

        {/* Page Content — scrollable, ID used for scroll detection */}
        <main id="main-content" className="flex-1 overflow-y-auto">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="p-5 lg:p-8 max-w-7xl mx-auto w-full"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
