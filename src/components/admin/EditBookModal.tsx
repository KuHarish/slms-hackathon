import { useState, useEffect } from 'react';
import { Edit2, Loader2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Book, BookCategory } from '@/types/library';

const BOOK_CATEGORIES: BookCategory[] = [
  'fiction', 'non-fiction', 'science', 'technology', 
  'history', 'philosophy', 'mathematics', 'literature', 
  'art', 'psychology'
];

interface EditBookModalProps {
  book: Book;
  onSuccess: () => void;
  onCancel: () => void;
  token?: string; 
}

export default function EditBookModal({ book, onSuccess, onCancel, token }: EditBookModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: book.title,
    author: book.author,
    isbn: book.isbn || '', // Fallback for mock data without ISBN
    category: book.category,
    description: book.description,
    totalCopies: book.totalCopies,
    publishedYear: new Date().getFullYear(),
    coverImage: book.coverUrl || ''
  });

  useEffect(() => {
    // Reset form when the book changes
    setFormData({
      title: book.title,
      author: book.author,
      isbn: book.isbn || '',
      category: book.category,
      description: book.description,
      totalCopies: book.totalCopies,
      publishedYear: new Date().getFullYear(), // Fallback
      coverImage: book.coverUrl || ''
    });
  }, [book]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'totalCopies' || name === 'publishedYear' ? Number(value) : value 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const authToken = token || localStorage.getItem('token');
      const res = await fetch(`http://localhost:3000/api/books/${book.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to edit book');
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-card rounded-xl border border-border shadow-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6 sticky top-0 bg-card py-2 z-10 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Edit2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-display text-xl text-foreground">Edit Book</h2>
              <p className="text-sm text-muted-foreground">{formData.title}</p>
            </div>
          </div>
          <button onClick={onCancel} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title">Book Title *</Label>
              <Input 
                id="title" name="title" required 
                value={formData.title} onChange={handleChange} 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="author">Author *</Label>
              <Input 
                id="author" name="author" required 
                value={formData.author} onChange={handleChange} 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="isbn">ISBN *</Label>
              <Input 
                id="isbn" name="isbn" required 
                value={formData.isbn} onChange={handleChange} 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select 
                id="category" name="category" 
                value={formData.category} onChange={handleChange}
                className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring capitalize"
              >
                <option value="general">General</option>
                {BOOK_CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalCopies">Total Copies *</Label>
              <Input 
                id="totalCopies" name="totalCopies" type="number" min="1" required 
                value={formData.totalCopies} onChange={handleChange} 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="publishedYear">Published Year</Label>
              <Input 
                id="publishedYear" name="publishedYear" type="number" min="1000" max={new Date().getFullYear() + 1} 
                value={formData.publishedYear} onChange={handleChange} 
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="coverImage">Cover Image URL</Label>
            <Input 
              id="coverImage" name="coverImage" type="url" 
              value={formData.coverImage} onChange={handleChange} 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" name="description" rows={4} 
              value={formData.description} onChange={handleChange} 
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
            <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
