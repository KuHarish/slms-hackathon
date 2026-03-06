import type { User, Book, BorrowRecord, Notification, Review, BookRequest, Badge, TokenTransaction } from '@/types/library';

// ============================================
// Badges
// ============================================
export const badges: Badge[] = [
  { id: 'b1', name: 'Bookworm', icon: '📚', description: 'Borrowed 10+ books', requiredTokens: 50 },
  { id: 'b2', name: 'Speed Reader', icon: '⚡', description: 'Returned 5 books early', requiredTokens: 100 },
  { id: 'b3', name: 'Scholar', icon: '🎓', description: 'Active community member', requiredTokens: 200 },
  { id: 'b4', name: 'Librarian Star', icon: '⭐', description: 'Top contributor', requiredTokens: 500 },
];

// ============================================
// Current User (Student)
// ============================================
export const currentUser: User = {
  id: 'u1',
  name: 'Alex Rivera',
  email: 'alex@university.edu',
  role: 'user',
  avatarUrl: '',
  tokens: 120,
  badges: [badges[0], badges[1]],
  joinedAt: '2024-09-01',
  borrowCount: 14,
};

// ============================================
// Admin User
// ============================================
export const adminUser: User = {
  id: 'adm1',
  name: 'Prof. James Carter',
  email: 'james.carter@university.edu',
  role: 'admin',
  avatarUrl: '',
  tokens: 0,
  badges: [badges[2], badges[3]],
  joinedAt: '2022-06-01',
  borrowCount: 0,
};

// ============================================
// Books
// ============================================
export const books: Book[] = [
  {
    id: 'bk1', title: 'The Design of Everyday Things', author: 'Don Norman',
    isbn: '978-0465050659', category: 'technology', tags: ['design', 'ux', 'psychology'],
    description: 'A classic exploration of how design serves as the communication between object and user, and how to optimize that conduit of communication in order to make the experience of using the object pleasurable.',
    coverUrl: '', totalCopies: 5, availableCopies: 2, rating: 4.5, reviewCount: 23, addedAt: '2024-01-15',
  },
  {
    id: 'bk2', title: 'Sapiens: A Brief History of Humankind', author: 'Yuval Noah Harari',
    isbn: '978-0062316097', category: 'history', tags: ['history', 'anthropology', 'civilization'],
    description: 'A groundbreaking narrative of humanity\'s creation and evolution that explores how biology and history have defined us.',
    coverUrl: '', totalCopies: 8, availableCopies: 0, rating: 4.7, reviewCount: 45, addedAt: '2024-02-10',
  },
  {
    id: 'bk3', title: 'Clean Code', author: 'Robert C. Martin',
    isbn: '978-0132350884', category: 'technology', tags: ['programming', 'software', 'best-practices'],
    description: 'A handbook of agile software craftsmanship. Even bad code can function. But if code isn\'t clean, it can bring a development organization to its knees.',
    coverUrl: '', totalCopies: 6, availableCopies: 3, rating: 4.3, reviewCount: 34, addedAt: '2024-01-20',
  },
  {
    id: 'bk4', title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman',
    isbn: '978-0374533557', category: 'psychology', tags: ['psychology', 'decision-making', 'behavioral'],
    description: 'An exploration of the two systems that drive the way we think—System 1 is fast, intuitive, and emotional; System 2 is slower, more deliberative, and more logical.',
    coverUrl: '', totalCopies: 4, availableCopies: 1, rating: 4.6, reviewCount: 38, addedAt: '2024-03-05',
  },
  {
    id: 'bk5', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald',
    isbn: '978-0743273565', category: 'fiction', tags: ['classic', 'american', 'novel'],
    description: 'The story of the mysteriously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan.',
    coverUrl: '', totalCopies: 10, availableCopies: 7, rating: 4.2, reviewCount: 52, addedAt: '2024-01-05',
  },
  {
    id: 'bk6', title: 'A Brief History of Time', author: 'Stephen Hawking',
    isbn: '978-0553380163', category: 'science', tags: ['physics', 'cosmology', 'universe'],
    description: 'A landmark volume in science writing that explores questions about the universe\'s origin and fate.',
    coverUrl: '', totalCopies: 3, availableCopies: 0, rating: 4.8, reviewCount: 29, addedAt: '2024-04-12',
  },
  {
    id: 'bk7', title: 'Meditations', author: 'Marcus Aurelius',
    isbn: '978-0140449334', category: 'philosophy', tags: ['stoicism', 'philosophy', 'ancient'],
    description: 'The private thoughts of the world\'s most powerful man, giving advice on everything from living in the world to coping with adversity.',
    coverUrl: '', totalCopies: 4, availableCopies: 2, rating: 4.4, reviewCount: 19, addedAt: '2024-02-28',
  },
  {
    id: 'bk8', title: 'Introduction to Algorithms', author: 'Thomas H. Cormen',
    isbn: '978-0262033848', category: 'mathematics', tags: ['algorithms', 'computer-science', 'textbook'],
    description: 'The leading textbook on algorithms, comprehensive and accessible to all levels of readers.',
    coverUrl: '', totalCopies: 7, availableCopies: 4, rating: 4.1, reviewCount: 16, addedAt: '2024-01-10',
  },
];

// ============================================
// Borrow Records
// ============================================
export const borrowRecords: BorrowRecord[] = [
  { id: 'br1', userId: 'u1', bookId: 'bk1', borrowedAt: '2026-01-10', dueDate: '2026-02-10', returnedAt: '2026-02-05', fine: 0, status: 'returned' },
  { id: 'br2', userId: 'u1', bookId: 'bk3', borrowedAt: '2026-02-01', dueDate: '2026-03-01', fine: 0, status: 'active' },
  { id: 'br3', userId: 'u1', bookId: 'bk4', borrowedAt: '2026-01-20', dueDate: '2026-02-20', fine: 3, status: 'overdue' },
  { id: 'br4', userId: 'u1', bookId: 'bk5', borrowedAt: '2025-12-01', dueDate: '2025-12-31', returnedAt: '2025-12-28', fine: 0, status: 'returned' },
  { id: 'br5', userId: 'u1', bookId: 'bk7', borrowedAt: '2025-11-15', dueDate: '2025-12-15', returnedAt: '2025-12-10', fine: 0, status: 'returned' },
];

// ============================================
// Notifications
// ============================================
export const notifications: Notification[] = [
  { id: 'n1', userId: 'u1', type: 'overdue', title: 'Book Overdue!', message: '"Thinking, Fast and Slow" is 3 days overdue. Return it to avoid additional fines.', isRead: false, createdAt: '2026-02-21', bookId: 'bk4' },
  { id: 'n2', userId: 'u1', type: 'due_soon', title: 'Due Date Approaching', message: '"Clean Code" is due in 6 days. Return by March 1st.', isRead: false, createdAt: '2026-02-22', bookId: 'bk3' },
  { id: 'n3', userId: 'u1', type: 'badge_earned', title: 'New Badge! 🎉', message: 'You earned the "Speed Reader" badge for returning 5 books early!', isRead: true, createdAt: '2026-02-05' },
  { id: 'n4', userId: 'u1', type: 'available', title: 'Book Available!', message: '"Sapiens" is now available. Hurry before it\'s gone!', isRead: true, createdAt: '2026-01-28', bookId: 'bk2' },
];

// ============================================
// Reviews
// ============================================
export const reviews: Review[] = [
  {
    id: 'r1', userId: 'u1', bookId: 'bk1', rating: 5, likes: 12,
    content: 'This book completely changed how I think about design. Every page is packed with insights that are relevant to anyone who creates products. The examples are timeless and the principles are universal.',
    createdAt: '2026-02-06', userName: 'Alex Rivera', userBadge: badges[1],
    comments: [
      { id: 'c1', userId: 'u2', userName: 'Priya Sharma', content: 'Totally agree! The door handle example stuck with me forever.', createdAt: '2026-02-07' },
    ],
  },
  {
    id: 'r2', userId: 'u3', bookId: 'bk2', rating: 5, likes: 24,
    content: 'Harari has a gift for making complex ideas accessible. This book will make you question everything you thought you knew about human history and our place in the world.',
    createdAt: '2026-01-15', userName: 'Jordan Lee', userBadge: badges[2],
    comments: [
      { id: 'c2', userId: 'u1', userName: 'Alex Rivera', content: 'The cognitive revolution chapter was mind-blowing!', createdAt: '2026-01-16' },
      { id: 'c3', userId: 'u4', userName: 'Sam Chen', content: 'I read this three times. Gets better each time.', createdAt: '2026-01-17' },
    ],
  },
  {
    id: 'r3', userId: 'u2', bookId: 'bk3', rating: 4, likes: 18,
    content: 'Essential reading for any developer. Some chapters are more relevant than others, but the core message about writing readable code is invaluable.',
    createdAt: '2026-02-10', userName: 'Priya Sharma', userBadge: badges[0],
    comments: [],
  },
  {
    id: 'r4', userId: 'u4', bookId: 'bk4', rating: 5, likes: 31,
    content: 'Kahneman brilliantly explains the biases that govern our thinking. After reading this, you\'ll never make decisions the same way again.',
    createdAt: '2026-01-20', userName: 'Sam Chen',
    comments: [
      { id: 'c4', userId: 'u1', userName: 'Alex Rivera', content: 'The anchoring effect section was eye-opening.', createdAt: '2026-01-21' },
    ],
  },
];

// ============================================
// All Students (for librarian view)
// ============================================
export const allUsers: User[] = [
  currentUser,
  { id: 'u2', name: 'Priya Sharma', email: 'priya@university.edu', role: 'user', tokens: 85, badges: [badges[0]], joinedAt: '2024-10-12', borrowCount: 9 },
  { id: 'u3', name: 'Jordan Lee', email: 'jordan@university.edu', role: 'user', tokens: 210, badges: [badges[0], badges[1], badges[2]], joinedAt: '2024-08-20', borrowCount: 22 },
  { id: 'u4', name: 'Sam Chen', email: 'sam@university.edu', role: 'user', tokens: 45, badges: [], joinedAt: '2025-01-15', borrowCount: 5 },
  { id: 'u5', name: 'Maya Johnson', email: 'maya@university.edu', role: 'user', tokens: 60, badges: [badges[0]], joinedAt: '2025-03-01', borrowCount: 7 },
];

// ============================================
// All Borrow Records (multi-student for librarian)
// ============================================
export const allBorrowRecords: BorrowRecord[] = [
  ...borrowRecords,
  { id: 'br6', userId: 'u2', bookId: 'bk2', borrowedAt: '2026-01-15', dueDate: '2026-02-15', fine: 0, status: 'overdue' },
  { id: 'br7', userId: 'u2', bookId: 'bk6', borrowedAt: '2026-02-01', dueDate: '2026-03-01', fine: 0, status: 'active' },
  { id: 'br8', userId: 'u3', bookId: 'bk8', borrowedAt: '2026-01-05', dueDate: '2026-02-05', fine: 0, status: 'overdue' },
  { id: 'br9', userId: 'u4', bookId: 'bk5', borrowedAt: '2026-02-10', dueDate: '2026-03-10', fine: 0, status: 'active' },
  { id: 'br10', userId: 'u5', bookId: 'bk7', borrowedAt: '2026-01-20', dueDate: '2026-02-20', fine: 0, status: 'overdue' },
  { id: 'br11', userId: 'u5', bookId: 'bk1', borrowedAt: '2026-02-05', dueDate: '2026-03-05', fine: 0, status: 'active' },
];

// ============================================
// Book Requests
// ============================================
export const bookRequests: BookRequest[] = [
  { id: 'req1', userId: 'u1', userName: 'Alex Rivera', title: 'Atomic Habits', author: 'James Clear', reason: 'Very popular self-improvement book, many students have requested it.', status: 'approved', createdAt: '2026-01-05' },
  { id: 'req2', userId: 'u1', userName: 'Alex Rivera', title: 'The Pragmatic Programmer', author: 'David Thomas', reason: 'Essential reading for CS students.', status: 'pending', createdAt: '2026-02-15' },
  { id: 'req3', userId: 'u3', userName: 'Jordan Lee', title: 'Designing Data-Intensive Applications', author: 'Martin Kleppmann', reason: 'Best book on distributed systems, needed for advanced CS course.', status: 'pending', createdAt: '2026-02-18' },
  { id: 'req4', userId: 'u5', userName: 'Maya Johnson', title: 'The Art of War', author: 'Sun Tzu', reason: 'Classic strategy text useful for business and philosophy courses.', status: 'pending', createdAt: '2026-02-20' },
  { id: 'req5', userId: 'u2', userName: 'Priya Sharma', title: 'Eloquent JavaScript', author: 'Marijn Haverbeke', reason: 'Free online but having physical copies in the library would help students.', status: 'rejected', createdAt: '2026-01-28' },
];

// ============================================
// Token Transactions
// ============================================
export const tokenTransactions: TokenTransaction[] = [
  { id: 't1', userId: 'u1', amount: 10, type: 'earned', reason: 'Returned "The Great Gatsby" 3 days early', createdAt: '2025-12-28' },
  { id: 't2', userId: 'u1', amount: 15, type: 'earned', reason: 'Returned "Meditations" 5 days early', createdAt: '2025-12-10' },
  { id: 't3', userId: 'u1', amount: 10, type: 'earned', reason: 'Returned "Design of Everyday Things" 5 days early', createdAt: '2026-02-05' },
  { id: 't4', userId: 'u1', amount: -20, type: 'redeemed', reason: 'Redeemed tokens to reduce late fee', createdAt: '2026-01-15' },
  { id: 't5', userId: 'u1', amount: 25, type: 'earned', reason: 'Wrote 3 book reviews this month', createdAt: '2026-02-10' },
];

// ============================================
// Fine Calculation Logic
// Settings config
export const MAX_BORROW_DAYS = 14;
export const FINE_PER_DAY = 0.50; // ₹0.50 per day
export const MAX_BORROW_LIMIT = 5;
export const TOKENS_PER_EARLY_DAY = 3;
export const TOKEN_FINE_REDEMPTION_VALUE = 0.25; // Each token = ₹0.25 off fine

export function calculateFine(dueDate: string): number {
  const due = new Date(dueDate);
  const now = new Date();
  const diffMs = now.getTime() - due.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays * FINE_PER_DAY : 0;
}

export function calculateEarlyReturnTokens(dueDate: string, returnDate: string): number {
  const due = new Date(dueDate);
  const returned = new Date(returnDate);
  const diffMs = due.getTime() - returned.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays * TOKENS_PER_EARLY_DAY : 0;
}
