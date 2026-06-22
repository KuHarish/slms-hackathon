import { API_URL } from '@/config';
import { useState } from 'react';
import { useZxing } from 'react-zxing';
import { Camera, CameraOff, RefreshCw, AlertCircle, CheckCircle2, Loader2, Book, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface BarcodeScannerProps {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
  onClose?: () => void;
}

export default function BarcodeScanner({ onSuccess, onError, onClose }: BarcodeScannerProps) {
  // State requirements from prompt
  const [scannedCode, setScannedCode] = useState<string>('');
  const [manualBookId, setManualBookId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [scanningEnabled, setScanningEnabled] = useState<boolean>(true);

  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.15);
    } catch (err) {
      console.error('Failed to play beep:', err);
    }
  };

  const { ref } = useZxing({
    paused: !scanningEnabled || !!scannedCode || loading,
    onResult(result) {
      if (scannedCode || manualBookId) return; // Prevent continuous trigger
      playBeep();
      setScannedCode(result.getText());
    },
    onError(err) {
      if (err.name === 'NotFoundException') return;
      console.error('Scanner error:', err);
    }
  });

  const handleCheckout = async () => {
    const bookId = scannedCode || manualBookId;
    if (!bookId.trim()) {
      setError("Please scan or enter a Book ID to checkout.");
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const user_id = localStorage.getItem("user_id");
      if (!user_id) {
        throw new Error("User not logged in. Please sign in first.");
      }

      const res = await fetch(API_URL + '/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          user_id,
          book_id: bookId.trim()
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Checkout failed');
      }

      setSuccess(data.message || 'Book checked out successfully!');
      setScanningEnabled(false);
      
      if (onSuccess) onSuccess(data);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      if (onError) onError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setScannedCode('');
    setManualBookId('');
    setError('');
    setSuccess('');
    setLoading(false);
    setScanningEnabled(true);
  };

  return (
    <div className="max-w-md mx-auto bg-card rounded-2xl border border-border shadow-card overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-border flex items-center justify-between bg-muted/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-gold flex items-center justify-center">
            <Book className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-display text-lg text-foreground">Scan Book Checkout</h2>
            <p className="text-xs text-muted-foreground">Scan barcode or enter book ID manually</p>
          </div>
        </div>
        {onClose && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose} 
            className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-full"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      <div className="p-5 space-y-4">
        {/* Output Alerts */}
        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
          </div>
        )}
        {success && (
          <div className="p-3 rounded-lg bg-success/10 border border-success/20 text-success-foreground text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-success" /> {success}
          </div>
        )}

        {/* 1. Scanner Preview */}
        {scanningEnabled && !scannedCode && !success && (
          <div className="relative aspect-video bg-black rounded-xl overflow-hidden border border-border group border-dashed">
            <video ref={ref} className="w-full h-full object-cover" />
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-0.5 bg-accent opacity-75 shadow-glow animate-pulse" />
            <div className="absolute inset-0 border-2 border-accent/20 rounded-xl m-4 border-dashed animate-pulse" />
          </div>
        )}

        {/* 2. Manual / Scanned Code Input Form */}
        {!success && (
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground">Manual / Scanned Book ID</label>
            <Input
              placeholder="Enter Book ID manually"
              value={scannedCode || manualBookId}
              onChange={(e) => {
                setManualBookId(e.target.value);
                setScannedCode(''); // Manual typing overrides scanned value
              }}
              disabled={loading}
              className="text-center font-mono tracking-wider"
            />
          </div>
        )}

        {/* 3. Pre-Confirmation state message */}
        {scannedCode && !success && (
          <div className="p-3 rounded-lg bg-accent/10 border border-accent/20 text-accent-foreground text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-success" /> Code detected: <span className="font-bold">{scannedCode}</span>. Ready for checkout.
          </div>
        )}

        {/* 4. Action Controls */}
        <div className="flex flex-col gap-2">
          {/* Confirmation Button */}
          {(scannedCode || manualBookId) && !success && (
            <Button 
              onClick={handleCheckout} 
              disabled={loading || !(scannedCode || manualBookId).trim()}
              className="w-full font-semibold"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing Checkout...
                </>
              ) : 'Confirm Checkout'}
            </Button>
          )}

          {/* Controls to resets/toggles */}
          {success ? (
            <Button onClick={handleReset} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" /> Scan Another
            </Button>
          ) : (
            (scannedCode || manualBookId) && (
              <Button variant="outline" onClick={handleReset} className="w-full">
                Cancel / Scan Again
              </Button>
            )
          )}

          {/* Toggle Camera when idle */}
          {!scannedCode && !manualBookId && !success && (
            <Button 
              variant="outline" 
              onClick={() => setScanningEnabled(!scanningEnabled)} 
              className="w-full"
            >
              {scanningEnabled ? <CameraOff className="w-4 h-4 mr-2" /> : <Camera className="w-4 h-4 mr-2" />}
              {scanningEnabled ? "Stop Scan" : "Start Scan"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
