import type { Timestamp } from 'firebase/firestore';

export type ScanResult = {
    url: string;
    riskScore: number;
    isMalicious: boolean;
    explanation?: string;
    recommendedActions?: string;
    advice?: string;
    error?: string;
};

export type ScanHistoryItem = ScanResult & {
    id: string;
    scannedAt: string;
};

export interface CommunityReport {
    id: string;
    title: string;
    url: string;
    author: string;
    comment: string;
    rating: number;
    time: Timestamp;
    userId?: string;
}

export interface AnalyticsStats {
    totalVisits: number;
    totalScans: number;
}
