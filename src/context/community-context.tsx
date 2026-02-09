
'use client';

import { createContext, useContext, ReactNode, useCallback } from 'react';
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
  Firestore,
  writeBatch,
} from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase/provider';
import { useCollection } from 'react-firebase-hooks/firestore';
import type { CommunityReport } from '@/lib/types';
import type { ReportFormData } from '@/components/community/community-page';
import { useToast } from '@/hooks/use-toast';

interface CommunityContextType {
  approvedReports: CommunityReport[];
  pendingReports: CommunityReport[];
  addReport: (reportData: ReportFormData) => void;
  approveReport: (report: CommunityReport) => void;
  deletePendingReport: (reportId: string) => void;
  loadingApproved: boolean;
  loadingPending: boolean;
  errorApproved?: Error;
  errorPending?: Error;
}

const CommunityContext = createContext<CommunityContextType | undefined>(undefined);

export function CommunityProvider({ children }: { children: ReactNode }) {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  
  const approvedReportsCollection = firestore ? collection(firestore as Firestore, 'community_reports') : null;
  const approvedReportsQuery = approvedReportsCollection ? query(approvedReportsCollection, orderBy('time', 'desc')) : null;
  const [approvedReportsSnapshot, loadingApproved, errorApproved] = useCollection(approvedReportsQuery);

  const pendingReportsCollection = firestore ? collection(firestore as Firestore, 'pending_reports') : null;
  const pendingReportsQuery = pendingReportsCollection ? query(pendingReportsCollection, orderBy('time', 'desc')) : null;
  const [pendingReportsSnapshot, loadingPending, errorPending] = useCollection(pendingReportsQuery);

  const approvedReports = approvedReportsSnapshot ? approvedReportsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CommunityReport)) : [];
  const pendingReports = pendingReportsSnapshot ? pendingReportsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CommunityReport)) : [];

  const addReport = useCallback(async (reportData: ReportFormData) => {
    if (!firestore) {
        toast({
            variant: 'destructive',
            title: 'Connection Error',
            description: 'Cannot connect to the database. Please try again.',
        });
        return;
    }
    try {
      const reportsCollection = collection(firestore, 'pending_reports');
      await addDoc(reportsCollection, {
        ...reportData,
        author: 'Anonymous',
        time: serverTimestamp(),
        userId: user?.uid || 'anonymous',
      });
      toast({
        title: 'Report Submitted',
        description: 'Thank you. Your report is pending admin approval.',
      });
    } catch (e) {
      console.error('Error adding report:', e);
      toast({
        variant: 'destructive',
        title: 'Submission Error',
        description: 'Could not submit your report. Please try again.',
      });
    }
  }, [firestore, toast, user]);

  const approveReport = useCallback(async (report: CommunityReport) => {
    if (!firestore) return;
    const batch = writeBatch(firestore);

    const approvedReportRef = doc(collection(firestore, 'community_reports'));
    const { id, ...reportData } = report;
    batch.set(approvedReportRef, reportData);

    const pendingReportRef = doc(firestore, 'pending_reports', id);
    batch.delete(pendingReportRef);

    try {
        await batch.commit();
        toast({ title: 'Report Approved', description: 'The report is now public.' });
    } catch (error) {
        console.error("Error approving report: ", error);
        toast({ variant: 'destructive', title: 'Approval Failed', description: 'Could not approve the report.'});
    }
  }, [firestore, toast]);

  const deletePendingReport = useCallback(async (reportId: string) => {
     if (!firestore) {
        toast({
            variant: 'destructive',
            title: 'Connection Error',
            description: 'Cannot connect to the database. Please try again.',
        });
        return;
    }
    try {
      const reportRef = doc(firestore, 'pending_reports', reportId);
      await deleteDoc(reportRef);
      toast({
        title: 'Report Deleted',
        description: 'The pending report has been removed.',
      });
    } catch (e) {
      console.error('Error deleting report:', e);
      toast({
        variant: 'destructive',
        title: 'Deletion Error',
        description: 'Could not delete the report. Please try again.',
      });
    }
  }, [firestore, toast]);
  
  const value = { reports: approvedReports, approvedReports, pendingReports, addReport, approveReport, deletePendingReport, loading: loadingApproved, loadingApproved, loadingPending, error: errorApproved, errorApproved, errorPending };

  return (
    <CommunityContext.Provider value={value}>
      {children}
    </CommunityContext.Provider>
  );
}

export function useCommunity() {
  const context = useContext(CommunityContext);
  if (context === undefined) {
    throw new Error('useCommunity must be used within a CommunityProvider');
  }
  return context;
}
