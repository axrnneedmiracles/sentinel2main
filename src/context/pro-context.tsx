'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useIsMounted } from '@/hooks/use-is-mounted';

interface ProContextType {
  isPro: boolean;
  userEmail: string | null;
  login: (email: string) => void;
  logout: () => void;
  redeemProStatus: () => void;
}

const PRO_STATUS_KEY = 'sentinel-pro-status';
const USER_EMAIL_KEY = 'sentinel-user-email';

const ProContext = createContext<ProContextType | undefined>(undefined);

export function ProProvider({ children }: { children: ReactNode }) {
  const [isPro, setIsPro] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const isMounted = useIsMounted();

  useEffect(() => {
    if (isMounted) {
      try {
        const proStatus = localStorage.getItem(PRO_STATUS_KEY);
        const savedEmail = localStorage.getItem(USER_EMAIL_KEY);
        if (proStatus === 'true' && savedEmail) {
          setIsPro(true);
          setUserEmail(savedEmail);
        }
      } catch (error) {
        console.error("Could not read from localStorage", error);
      }
    }
  }, [isMounted]);
  
  const login = (email: string) => {
    setUserEmail(email);
     if (isMounted) {
        try {
          localStorage.setItem(USER_EMAIL_KEY, email);
        } catch (error) {
            console.error("Could not save email to localStorage", error);
        }
    }
  };

  const redeemProStatus = () => {
    if (userEmail) {
      setIsPro(true);
      if (isMounted) {
        try {
          localStorage.setItem(PRO_STATUS_KEY, 'true');
        } catch (error) {
            console.error("Could not save pro status to localStorage", error);
        }
      }
    }
  };
  
  const logout = () => {
    setIsPro(false);
    setUserEmail(null);
    if (isMounted) {
      try {
        localStorage.removeItem(PRO_STATUS_KEY);
        localStorage.removeItem(USER_EMAIL_KEY);
      } catch (error) {
          console.error("Could not clear localStorage", error);
      }
    }
  };

  return (
    <ProContext.Provider value={{ isPro, userEmail, login, redeemProStatus, logout }}>
      {children}
    </ProContext.Provider>
  );
}

export function usePro() {
  const context = useContext(ProContext);
  if (context === undefined) {
    throw new Error('usePro must be used within a ProProvider');
  }
  return context;
}
