
'use client';

import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Users, MessageCircleWarning, Star } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Slider } from '../ui/slider';
import { Label } from '../ui/label';
import { useCommunity } from '@/context/community-context';
import { formatDistanceToNow } from 'date-fns';
import type { ReportFormData } from './community-page';
import { Skeleton } from '../ui/skeleton';


interface CommunitySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}


export function CommunitySheet({ open, onOpenChange }: CommunitySheetProps) {
  const { approvedReports, addReport, loadingApproved } = useCommunity();
  const [newReport, setNewReport] = useState<ReportFormData>({ title: '', url: '', comment: '', rating: 5 });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewReport(prev => ({ ...prev, [name]: value }));
  };

  const handleRatingChange = (value: number[]) => {
    setNewReport(prev => ({...prev, rating: value[0]}));
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReport.title || !newReport.url || !newReport.comment) return;

    addReport(newReport);
    setNewReport({ title: '', url: '', comment: '', rating: 5 });
  };


  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg bg-card/30 backdrop-blur-lg border-primary/20">
          <SheetHeader className="text-left">
            <SheetTitle className="flex items-center gap-2">
              <Users className="text-primary" />
              Community Reports
            </SheetTitle>
            <SheetDescription>
              See what others are reporting and share your own findings.
            </SheetDescription>
          </SheetHeader>
          
          <div className="py-4">
            <form onSubmit={handleSubmit} className="space-y-4 p-4 rounded-lg bg-background/50 border border-border/50">
              <h3 className="text-lg font-semibold text-primary-foreground">Submit a Report</h3>
              <Input name="title" placeholder="Report Title (e.g. 'Phishing attempt')" value={newReport.title} onChange={handleInputChange} className="bg-input" required />
              <Input name="url" placeholder="Malicious URL" value={newReport.url} onChange={handleInputChange} className="bg-input" required />
              <Textarea name="comment" placeholder="Describe the scam..." value={newReport.comment} onChange={handleInputChange} className="bg-input" required/>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                   <Label htmlFor="rating">Your Rating</Label>
                   <span className="text-primary font-bold">{newReport.rating}/10</span>
                </div>
                <Slider id="rating" min={1} max={10} step={1} value={[newReport.rating]} onValueChange={handleRatingChange} />
              </div>
              <Button type="submit" className="w-full">Submit Report</Button>
            </form>
          </div>

          <ScrollArea className="h-[calc(100% - 24rem)] pr-4">
            <div className="py-4 space-y-4">
              {loadingApproved ? (
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-40 w-full" />)}
                </div>
              ) : approvedReports.length > 0 ? (
                approvedReports.map((report) => (
                  <Card key={report.id} className="bg-background/50 border-border/50">
                    <CardHeader>
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <CardTitle className="text-base font-bold flex items-center gap-2">
                            <MessageCircleWarning className="text-destructive w-5 h-5" />
                             {report.title}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground break-all">{report.url}</p>
                        </div>
                        <Avatar>
                          <AvatarFallback className="bg-secondary text-secondary-foreground">{report.author.charAt(0)}</AvatarFallback>
                        </Avatar>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">“{report.comment}”</p>
                    </CardContent>
                    <CardFooter className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-1 text-destructive font-bold">
                        <Star className="w-4 h-4 fill-destructive text-destructive" />
                        <span>{report.rating}/10 Rating</span>
                      </div>
                      <p className="text-muted-foreground">{report.time ? formatDistanceToNow(new Date(report.time.toDate()), { addSuffix: true }) : 'Just now'}</p>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">No community reports yet. Be the first!</p>
                </div>
              )}
            </div>
          </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
