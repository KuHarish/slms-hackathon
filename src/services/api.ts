/**
 * ============================================
 * API Service Layer (Placeholder)
 * ============================================
 * 
 * This service layer uses in-memory mock data.
 * Replace with real API calls when backend is configured.
 * 
 * Future integration points:
 * - Replace mock imports with fetch/axios calls
 * - Point BASE_URL to your Express backend
 * - Add JWT token to Authorization headers
 * 
 * Example:
 *   const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
 *   
 *   async function getBooks(filters) {
 *     const res = await fetch(`${BASE_URL}/books?${new URLSearchParams(filters)}`);
 *     return res.json();
 *   }
 */

import { books, borrowRecords, reviews, notifications, currentUser, bookRequests, tokenTransactions, calculateFine } from '@/data/mockData';
import type { Book, BookFilters, BorrowRecord, Review, Notification, BookRequest, User, TokenTransaction } from '@/types/library';

// Placeholder: Replace with real API base URL
// const BASE_URL = '/api';

// ============================================
// Book Service
// ============================================
export const BookService = {
  async getAll(filters?: BookFilters): Promise<Book[]> {
    let result = [...books];
    if (filters?.category) result = result.filter(b => b.category === filters.category);
    if (filters?.available) result = result.filter(b => b.availableCopies > 0);
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(b =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.tags.some(t => t.includes(q))
      );
    }
    if (filters?.sortBy === 'rating') result.sort((a, b) => b.rating - a.rating);
    if (filters?.sortBy === 'recent') result.sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
    if (filters?.sortBy === 'title') result.sort((a, b) => a.title.localeCompare(b.title));
    return result;
  },

  async getById(id: string): Promise<Book | null> {
    return books.find(b => b.id === id) || null;
  },

  async search(query: string): Promise<Book[]> {
    return this.getAll({ search: query });
  },
};

// ============================================
// Borrow Service
// ============================================
export const BorrowService = {
  async getHistory(userId: string): Promise<(BorrowRecord & { book?: Book })[]> {
    return borrowRecords
      .filter(r => r.userId === userId)
      .map(r => ({ ...r, book: books.find(b => b.id === r.bookId), fine: r.status === 'overdue' ? calculateFine(r.dueDate) : r.fine }));
  },

  async getActive(userId: string): Promise<(BorrowRecord & { book?: Book })[]> {
    return borrowRecords
      .filter(r => r.userId === userId && r.status !== 'returned')
      .map(r => ({ ...r, book: books.find(b => b.id === r.bookId), fine: r.status === 'overdue' ? calculateFine(r.dueDate) : r.fine }));
  },
};

// ============================================
// Review Service
// ============================================
export const ReviewService = {
  async getByBook(bookId: string): Promise<Review[]> {
    return reviews.filter(r => r.bookId === bookId);
  },

  async getRecent(limit = 10): Promise<(Review & { book?: Book })[]> {
    return reviews
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit)
      .map(r => ({ ...r, book: books.find(b => b.id === r.bookId) }));
  },
};

// ============================================
// Notification Service
// ============================================
export const NotificationService = {
  async getAll(userId: string): Promise<Notification[]> {
    return notifications.filter(n => n.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getUnreadCount(userId: string): Promise<number> {
    return notifications.filter(n => n.userId === userId && !n.isRead).length;
  },
};

// ============================================
// User Service
// ============================================
export const UserService = {
  async getCurrent(): Promise<User> {
    return currentUser;
  },

  async getTokenHistory(userId: string): Promise<TokenTransaction[]> {
    return tokenTransactions.filter(t => t.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
};

// ============================================
// Book Request Service
// ============================================
export const BookRequestService = {
  async getByUser(userId: string): Promise<BookRequest[]> {
    return bookRequests.filter(r => r.userId === userId);
  },
};
