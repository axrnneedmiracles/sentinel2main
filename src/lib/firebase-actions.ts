
'use client';

import { initializeFirebase } from '@/firebase';
import { doc, getDoc, increment, setDoc, updateDoc } from 'firebase/firestore';

async function getDb() {
  const { firestore } = initializeFirebase();
  if (!firestore) {
    throw new Error("Firestore is not initialized.");
  }
  return firestore;
}

export async function incrementVisitorCount() {
  try {
    const db = await getDb();
    const statsRef = doc(db, 'analytics', 'stats');
    
    // Use updateDoc with increment for atomic operation
    await updateDoc(statsRef, {
      totalVisits: increment(1),
    }).catch(async (error) => {
      // If the document doesn't exist, create it.
      if (error.code === 'not-found') {
        await setDoc(statsRef, { totalVisits: 1, totalScans: 0 });
      }
    });
  } catch (error) {
    console.error("Error incrementing visitor count:", error);
    // Fail silently so it doesn't crash the main app
  }
}

export async function incrementScanCount() {
  try {
    const db = await getDb();
    const statsRef = doc(db, 'analytics', 'stats');
    
    await updateDoc(statsRef, {
      totalScans: increment(1),
    }).catch(async (error) => {
       if (error.code === 'not-found') {
        await setDoc(statsRef, { totalVisits: 1, totalScans: 1 });
      }
    });
  } catch (error) {
    console.error("Error incrementing scan count:", error);
  }
}
