
'use client';

import { useState, useEffect } from 'react';
import { Users, MessageCircleWarning, Star } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Slider } from '../ui/slider';
import { Label } from '../ui/label';
import { useCommunity } from '@/context/community-context';
import type { CommunityReport } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '../ui/skeleton';

export interface ReportFormData {
  title: string;
  url: string;
  comment: string;
  rating: number;
}

interface CommunityPageProps {
  prefilledReport?: Partial<ReportFormData> | null;
  onFormSubmit?: () => void;
}

const ReportTime = ({ time }: { time: any }) => {
  const [formattedTime, setFormattedTime] = useState('');
  useEffect(() => {
    if (time) {
      const date = time.toDate ? time.toDate() : time;
      setFormattedTime(formatDistanceToNow(date, { addSuffix: true }));
    } else {
      setFormattedTime('Just now');
    }
  }, [time]);

  return <p className="text-muted-foreground">{formattedTime}</p>;
};

export function CommunityPage({ prefilledReport, onFormSubmit }: CommunityPageProps) {
  const { approvedReports, addReport, loadingApproved } = useCommunity();
  const [newReport, setNewReport] = useState<ReportFormData>({ title: '', url: '', comment: '', rating: 5 });

  useEffect(() => {
    if (prefilledReport) {
      setNewReport(prev => ({ ...prev, ...prefilledReport }));
    }
  }, [prefilledReport]);

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

    if (onFormSubmit) {
      onFormSubmit();
    }
  };


  return (
    <div className="w-full max-w-3xl animate-in fade-in zoom-in-95 space-y-8">
        <Card className="bg-card/30 backdrop-blur-lg border-primary/20">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl text-primary-foreground">
                    <Users className="text-primary w-8 h-8" />
                     Community Reports
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
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
            </CardContent>
        </Card>
        
        <div className="space-y-4">
             <h3 className="text-xl font-semibold text-center text-primary-foreground">Recent Reports</h3>
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
                      <ReportTime time={report.time} />
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">No community reports yet. Be the first!</p>
                </div>
              )}
        </div>
    </div>
  );
}
