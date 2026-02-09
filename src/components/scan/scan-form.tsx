
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Search, ClipboardPaste } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useIsMounted } from '@/hooks/use-is-mounted';

interface ScanFormProps {
  onScan: (text: string) => void;
  loading: boolean;
}

export function ScanForm({ onScan, loading }: ScanFormProps) {
  const [text, setText] = useState('');
  const { toast } = useToast();
  const isMounted = useIsMounted();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onScan(text);
  };
  
  const handlePaste = async () => {
    if(!isMounted) return;
    try {
      const clipboardText = await navigator.clipboard.readText();
      setText(clipboardText);
      toast({
          title: "Pasted from clipboard!",
          description: "Ready to scan.",
      });
    } catch (err) {
      toast({
          variant: 'destructive',
          title: "Failed to paste",
          description: "Please paste the message manually.",
      });
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-3xl mx-auto space-y-4"
    >
      <div className="relative">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste your suspicious message here..."
          className="bg-card/30 backdrop-blur-sm border-primary/30 rounded-lg shadow-lg p-4 pr-12 h-36 text-base transition-all focus-visible:ring-2 focus-visible:ring-accent focus-visible:border-accent cursor-target"
          disabled={loading}
        />
        <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            className="absolute top-3 right-3 text-muted-foreground hover:text-primary-foreground hover:bg-primary/50 cursor-target"
            onClick={handlePaste}
            disabled={loading}
            aria-label="Paste from clipboard"
        >
            <ClipboardPaste className="h-5 w-5" />
        </Button>
      </div>
      <Button
        type="submit"
        className="w-full text-lg font-bold bg-primary hover:bg-primary/90 rounded-lg shadow-lg h-14 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:scale-100 cursor-target"
        disabled={loading || !text.trim()}
      >
        {loading ? (
          <Loader2 className="animate-spin mr-2 h-6 w-6" />
        ) : (
          <Search className="mr-2 h-6 w-6" />
        )}
        Scan Message
      </Button>
    </form>
  );
}
