'use client';

import { useHistory } from '@/hooks/use-history';
import { History, ShieldAlert, ShieldCheck, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '../ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function HistoryPage() {
  const { history, clearHistory } = useHistory();

  return (
    <Card className="w-full max-w-3xl bg-card/30 backdrop-blur-lg border-primary/20 animate-in fade-in zoom-in-95">
        <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl text-primary-foreground">
                <History className="text-primary w-8 h-8" />
                Scan History
            </CardTitle>
            <CardDescription>A log of your recent scans, stored locally on your device.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
            {history.length > 0 ? (
              history.map((item) => (
                <div key={item.id} className="p-3 rounded-lg bg-background/50 flex items-center justify-between gap-4 border border-border/50">
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
        </CardContent>
        {history.length > 0 && (
            <CardFooter>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Clear History
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your scan history from this device.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={clearHistory}>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
            </CardFooter>
        )}
    </Card>
  );
}
