import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  AlertTriangle, Clock, Users, BookPlus, CheckCircle, XCircle,
  Mail, BookOpen, Shield, ChevronDown, ChevronUp, Search
} from 'lucide-react';
import { allBorrowRecords, allStudents, bookRequests, books, calculateFine } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import type { BookRequest } from '@/types/library';

export default function LibrarianDashboard() {
  const [requestStatuses, setRequestStatuses] = useState<Record<string, BookRequest['status']>>({});
  const [activeTab, setActiveTab] = useState<'overdue' | 'students' | 'requests'>('overdue');
  const [searchQuery, setSearchQuery] = useState('');

  // Overdue records with student + book info
  const overdueRecords = allBorrowRecords
    .filter(r => r.status === 'overdue')
    .map(r => ({
      ...r,
      book: books.find(b => b.id === r.bookId),
      student: allStudents.find(s => s.id === r.userId),
      fine: calculateFine(r.dueDate),
    }))
    .sort((a, b) => b.fine - a.fine);

  // Due soon (within 7 days)
  const dueSoonRecords = allBorrowRecords
    .filter(r => {
      if (r.status !== 'active') return false;
      const daysLeft = Math.ceil((new Date(r.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return daysLeft <= 7 && daysLeft >= 0;
    })
    .map(r => ({
      ...r,
      book: books.find(b => b.id === r.bookId),
      student: allStudents.find(s => s.id === r.userId),
      daysLeft: Math.ceil((new Date(r.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
    }));

  const filteredStudents = allStudents.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRequestStatus = (req: BookRequest) => requestStatuses[req.id] || req.status;

  const handleApprove = (reqId: string) => {
    setRequestStatuses(prev => ({ ...prev, [reqId]: 'approved' }));
  };

  const handleReject = (reqId: string) => {
    setRequestStatuses(prev => ({ ...prev, [reqId]: 'rejected' }));
  };

  const pendingRequests = bookRequests.filter(r => getRequestStatus(r) === 'pending');

  const stats = [
    { label: 'Overdue Books', value: overdueRecords.length, icon: AlertTriangle, color: 'bg-destructive/10 text-destructive' },
    { label: 'Due Soon', value: dueSoonRecords.length, icon: Clock, color: 'bg-warning/10 text-warning' },
    { label: 'Total Students', value: allStudents.length, icon: Users, color: 'bg-info/10 text-info' },
    { label: 'Pending Requests', value: pendingRequests.length, icon: BookPlus, color: 'bg-accent/10 text-accent' },
  ];

  const tabs = [
    { id: 'overdue' as const, label: 'Overdue Management', icon: AlertTriangle, count: overdueRecords.length },
    { id: 'students' as const, label: 'Student Directory', icon: Users, count: allStudents.length },
    { id: 'requests' as const, label: 'Book Requests', icon: BookPlus, count: pendingRequests.length },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
          <Shield className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-display text-3xl lg:text-4xl text-foreground">Librarian Dashboard</h1>
          <p className="text-muted-foreground mt-0.5">Manage books, students, and requests</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-card rounded-xl border border-border p-5 shadow-card"
          >
            <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-card-foreground">{stat.value}</p>
            <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-border">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-accent text-accent'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {tab.count > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === tab.id ? 'bg-accent/10 text-accent' : 'bg-muted text-muted-foreground'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Overdue Management */}
      {activeTab === 'overdue' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          {/* Overdue Table */}
          <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
            <div className="p-4 lg:p-6 border-b border-border">
              <h2 className="font-display text-lg text-card-foreground flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" /> Overdue Books
              </h2>
            </div>
            {overdueRecords.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">No overdue books 🎉</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Book</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Days Overdue</TableHead>
                    <TableHead>Fine</TableHead>
                    <TableHead>Contact</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {overdueRecords.map(record => {
                    const daysOverdue = Math.floor((Date.now() - new Date(record.dueDate).getTime()) / (1000 * 60 * 60 * 24));
                    return (
                      <TableRow key={record.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground">
                              {record.student?.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <p className="font-medium text-card-foreground text-sm">{record.student?.name}</p>
                              <p className="text-xs text-muted-foreground">{record.student?.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Link to={`/books/${record.bookId}`} className="text-sm font-medium text-accent hover:underline">
                            {record.book?.title}
                          </Link>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(record.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </TableCell>
                        <TableCell>
                          <Badge variant="destructive" className="text-xs">
                            {daysOverdue} days
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm font-semibold text-destructive">
                          ${record.fine.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <a
                            href={`mailto:${record.student?.email}?subject=Overdue Book: ${record.book?.title}&body=Dear ${record.student?.name},%0A%0AThe book "${record.book?.title}" was due on ${new Date(record.dueDate).toLocaleDateString()}. Please return it as soon as possible.%0A%0AThank you.`}
                            className="inline-flex"
                          >
                            <Button variant="outline" size="sm" className="gap-1.5">
                              <Mail className="w-3.5 h-3.5" /> Email
                            </Button>
                          </a>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>

          {/* Due Soon */}
          {dueSoonRecords.length > 0 && (
            <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
              <div className="p-4 lg:p-6 border-b border-border">
                <h2 className="font-display text-lg text-card-foreground flex items-center gap-2">
                  <Clock className="w-5 h-5 text-warning" /> Due Soon (Next 7 Days)
                </h2>
              </div>
              <div className="divide-y divide-border">
                {dueSoonRecords.map(record => (
                  <div key={record.id} className="p-4 lg:px-6 flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground">
                      {record.student?.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-card-foreground">{record.student?.name}</p>
                      <p className="text-xs text-muted-foreground">{record.book?.title}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {record.daysLeft} days left
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Student Directory */}
      {activeTab === 'students' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search students by name or email…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-card text-card-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Books Borrowed</TableHead>
                  <TableHead>Tokens</TableHead>
                  <TableHead>Badges</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Contact</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map(student => {
                  const activeCount = allBorrowRecords.filter(r => r.userId === student.id && r.status !== 'returned').length;
                  const overdueCount = allBorrowRecords.filter(r => r.userId === student.id && r.status === 'overdue').length;
                  return (
                    <TableRow key={student.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-xs font-semibold text-accent">
                            {student.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span className="font-medium text-sm text-card-foreground">{student.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{student.email}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-card-foreground">{student.borrowCount} total</span>
                          {activeCount > 0 && <Badge variant="secondary" className="text-xs">{activeCount} active</Badge>}
                          {overdueCount > 0 && <Badge variant="destructive" className="text-xs">{overdueCount} overdue</Badge>}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm font-medium text-card-foreground">{student.tokens}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {student.badges.length === 0 && <span className="text-xs text-muted-foreground">—</span>}
                          {student.badges.map(b => (
                            <span key={b.id} title={b.name} className="text-base">{b.icon}</span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(student.joinedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </TableCell>
                      <TableCell>
                        <a href={`mailto:${student.email}`} className="inline-flex">
                          <Button variant="ghost" size="sm"><Mail className="w-4 h-4" /></Button>
                        </a>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </motion.div>
      )}

      {/* Book Requests */}
      {activeTab === 'requests' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {bookRequests.map(req => {
            const status = getRequestStatus(req);
            return (
              <div key={req.id} className="bg-card rounded-xl border border-border shadow-card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium text-card-foreground">{req.title}</h3>
                      <span className="text-sm text-muted-foreground">by {req.author}</span>
                      <Badge
                        variant={status === 'approved' ? 'default' : status === 'rejected' ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">{req.reason}</p>
                    <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                      <span>Requested by <strong className="text-card-foreground">{req.userName}</strong></span>
                      <span>•</span>
                      <span>{new Date(req.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>
                  {status === 'pending' && (
                    <div className="flex gap-2 flex-shrink-0">
                      <Button size="sm" onClick={() => handleApprove(req.id)} className="gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5" /> Approve
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleReject(req.id)} className="gap-1.5">
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
