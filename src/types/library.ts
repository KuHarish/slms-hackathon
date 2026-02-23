// ============================================
// Database Schema Types (mirrors SQL schema)
// Ready for Prisma/TypeORM integration
// ============================================

export type UserRole = 'student' | 'librarian' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  tokens: number;
  badges: Badge[];
  joinedAt: string;
  borrowCount: number;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: BookCategory;
  description: string;
  coverUrl: string;
  totalCopies: number;
  availableCopies: number;
  rating: number;
  reviewCount: number;
  addedAt: string;
  tags: string[];
}

export type BookCategory =
  | 'fiction'
  | 'non-fiction'
  | 'science'
  | 'technology'
  | 'history'
  | 'philosophy'
  | 'mathematics'
  | 'literature'
  | 'art'
  | 'psychology';

export interface BorrowRecord {
  id: string;
  userId: string;
  bookId: string;
  borrowedAt: string;
  dueDate: string;
  returnedAt?: string;
  fine: number;
  status: 'active' | 'returned' | 'overdue';
}

export interface Notification {
  id: string;
  userId: string;
  type: 'due_soon' | 'overdue' | 'available' | 'badge_earned' | 'request_approved';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  bookId?: string;
}

export interface Review {
  id: string;
  userId: string;
  bookId: string;
  rating: number;
  content: string;
  createdAt: string;
  likes: number;
  userName: string;
  userAvatar?: string;
  userBadge?: Badge;
  comments: ReviewComment[];
}

export interface ReviewComment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
}

export interface BookRequest {
  id: string;
  userId: string;
  userName: string;
  title: string;
  author: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  requiredTokens: number;
}

export interface TokenTransaction {
  id: string;
  userId: string;
  amount: number;
  type: 'earned' | 'redeemed';
  reason: string;
  createdAt: string;
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  pageSize: number;
}

// ============================================
// Service Interfaces (for future backend)
// ============================================

export interface IBookService {
  getAll(filters?: BookFilters): Promise<Book[]>;
  getById(id: string): Promise<Book | null>;
  search(query: string): Promise<Book[]>;
  updateAvailability(id: string, delta: number): Promise<void>;
}

export interface BookFilters {
  category?: BookCategory;
  available?: boolean;
  search?: string;
  sortBy?: 'title' | 'rating' | 'recent';
}

export interface IUserService {
  getById(id: string): Promise<User | null>;
  addTokens(userId: string, amount: number, reason: string): Promise<void>;
  redeemTokens(userId: string, amount: number): Promise<boolean>;
}

export interface IBorrowService {
  borrow(userId: string, bookId: string): Promise<BorrowRecord>;
  returnBook(recordId: string): Promise<{ tokensEarned: number }>;
  getHistory(userId: string): Promise<BorrowRecord[]>;
  calculateFine(record: BorrowRecord): number;
}
