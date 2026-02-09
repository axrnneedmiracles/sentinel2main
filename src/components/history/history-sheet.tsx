'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter
} from '@/components/ui/sheet';
import { useHistory } from '@/hooks/use-history';
import { History, ShieldAlert, ShieldCheck, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';

interface HistorySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HistorySheet({ open, onOpenChange }: HistorySheetProps) {
  const { history, clearHistory } = useHistory();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md bg-card/30 backdrop-blur-lg border-primary/20">
        <SheetHeader className="text-left">
          <SheetTitle className="flex items-center gap-2">
            <History className="text-primary" />
            Scan History
          </SheetTitle>
          <SheetDescription>
            A log of your recent scans. History is stored locally on your device.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[calc(100%-8rem)]">
          <div className="py-4 space-y-3">
            {history.length > 0 ? (
              history.map((item) => (
                <div key={item.id} className="p-3 rounded-lg bg-background/50 flex items-center justify-between gap-4">
                  <div className="flex-shrink-0">
                    {item.isMalicious ? (
                      <ShieldAlert className="w-6 h-6 text-destructive" />
                    ) : (
                      <ShieldCheck className="w-6 h-6 text-accent" />
                    )}
                  </div>
                  <div className="flex-grow overflow-hidden">
                    <p className="truncate font-medium text-sm">{item.url}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(item.scannedAt), { addSuffix: true })}
                    </p>
                  </div>
                  <Badge variant={item.isMalicious ? 'destructive' : 'default'} className={!item.isMalicious ? 'bg-accent hover:bg-accent/80' : ''}>
                    {item.isMalicious ? 'Threat' : 'Safe'}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-10">
                <p className="text-muted-foreground">No scans in your history yet.</p>
              </div>
            )}
          </div>
        </ScrollArea>
        <SheetFooter className="absolute bottom-0 left-0 right-0 p-4 bg-card/30 backdrop-blur-lg border-t border-primary/20">
          <Button variant="destructive" onClick={clearHistory} disabled={history.length === 0} className="w-full">
            <Trash2 className="mr-2 h-4 w-4" />
            Clear History
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
