import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import TargetCursor from '@/components/cursor/target-cursor';
import { AdminProvider } from '@/context/admin-context';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { CommunityProvider } from '@/context/community-context';
import { ProProvider } from '@/context/pro-context';

export const metadata: Metadata = {
  title: 'Sentinel Scan',
  description: 'A sleek, futuristic link scanner app designed to detect and warn users about malicious messages.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          <ProProvider>
            <AdminProvider>
              <CommunityProvider>
                  <TargetCursor spinDuration={2} hideDefaultCursor={true} />
                  {children}
                  <Toaster />
              </CommunityProvider>
            </AdminProvider>
          </ProProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
