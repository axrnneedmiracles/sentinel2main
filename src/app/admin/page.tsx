
'use client';

import { useCommunity } from '@/context/community-context';
import { Shield, Trash2, LogOut, MessageCircleWarning, Star, Users, ScanSearch, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAdmin } from '@/context/admin-context';
import { formatDistanceToNow } from 'date-fns';
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
} from "@/components/ui/alert-dialog";
import { useAnalytics } from '@/hooks/use-analytics';
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const ReportTime = ({ time }: { time: any }) => {
  const [formattedTime, setFormattedTime] = useState('');
  useEffect(() => {
    if (time) {
      // Handle both server-side Timestamps and client-side Date objects
      const date = time.toDate ? time.toDate() : time;
      setFormattedTime(formatDistanceToNow(date, { addSuffix: true }));
    } else {
      setFormattedTime('Just now');
    }
  }, [time]);

  return <p className="text-muted-foreground">{formattedTime}</p>;
};

export default function AdminPage() {
  const { pendingReports, approveReport, deletePendingReport, loadingPending } = useCommunity();
  const { logout } = useAdmin();
  const { stats, loading: loadingAnalytics } = useAnalytics();

  return (
    <div className="w-full max-w-3xl animate-in fade-in zoom-in-95 space-y-8">
        <Card className="bg-card/30 backdrop-blur-lg border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="flex items-center gap-2 text-2xl text-primary-foreground">
                        <Shield className="text-primary w-8 h-8" />
                        Admin Panel
                    </CardTitle>
                    <CardDescription>Manage community reports and view analytics.</CardDescription>
                </div>
                <Button variant="ghost" onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                </Button>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-background/50 border-border/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Visitors</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{loadingAnalytics ? <Skeleton className="h-8 w-16" /> : stats.totalVisits}</div>
                        <p className="text-xs text-muted-foreground">Total site visits</p>
                    </CardContent>
                </Card>
                <Card className="bg-background/50 border-border/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
                        <ScanSearch className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{loadingAnalytics ? <Skeleton className="h-8 w-16" /> : stats.totalScans}</div>
                        <p className="text-xs text-muted-foreground">Total messages scanned</p>
                    </CardContent>
                </Card>
            </CardContent>
        </Card>

        <Card className="w-full max-w-3xl bg-card/30 backdrop-blur-lg border-primary/20">
            <CardHeader>
                <h3 className="text-xl font-semibold text-center text-primary-foreground">Pending Reports ({pendingReports.length})</h3>
            </CardHeader>
            <CardContent className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                {loadingPending ? (
                    <div className="space-y-3">
                        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-40 w-full" />)}
                    </div>
                ) : pendingReports.length > 0 ? (
                    pendingReports.map((report) => (
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
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <Avatar>
                                <AvatarFallback className="bg-secondary text-secondary-foreground">{report.author.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <Button variant="ghost" size="icon" className="text-accent hover:bg-accent/20 hover:text-accent-foreground" onClick={() => approveReport(report)}>
                                    <Check className="w-5 h-5"/>
                                </Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/20 hover:text-destructive-foreground">
                                            <Trash2 className="w-5 h-5"/>
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action will permanently delete this pending report. This cannot be undone.
                                        </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => deletePendingReport(report.id)}>Delete</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
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
                    <p className="text-muted-foreground">No pending reports to review.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    </div>
  );
}
