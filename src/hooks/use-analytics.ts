'use client';

import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import type { AnalyticsStats } from '@/lib/types';

const initialState: AnalyticsStats = {
  totalVisits: 0,
  totalScans: 0,
};

export function useAnalytics() {
  const [stats, setStats] = useState<AnalyticsStats>(initialState);
  const [loading, setLoading] = useState(true);
  const firestore = useFirestore();

  useEffect(() => {
    const statsRef = doc(firestore, 'analytics', 'stats');

    const unsubscribe = onSnapshot(
      statsRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setStats(docSnap.data() as AnalyticsStats);
        } else {
          setStats(initialState);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching analytics:", error);
        setStats(initialState);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [firestore]);

  return { stats, loading };
}
