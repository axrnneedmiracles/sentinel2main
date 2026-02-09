'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { BackgroundAnimation } from '@/components/background-animation';
import { Header } from '@/components/layout/header';
import { ScanForm } from '@/components/scan/scan-form';
import { ScanResultDisplay } from '@/components/scan/scan-result';
import { HistorySheet } from '@/components/history/history-sheet';
import { CommunitySheet } from '@/components/community/community-sheet';
import { AboutSheet } from '@/components/about/about-sheet';
import { scanMessage, scanImage } from '@/lib/actions';
import type { ScanResult } from '@/lib/types';
import { useHistory } from '@/hooks/use-history';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { HomeIcon, ImageUp, Loader2 } from 'lucide-react';
import MagicBento from '@/components/ui/magic-bento';
import { HistoryPage } from '@/components/history/history-page';
import { CommunityPage, type ReportFormData } from '@/components/community/community-page';
import { AboutPage } from '@/components/about/about-page';
import AdminPage from './admin/page';
import AdminLogin from './admin/login/page';
import { useAdmin } from '@/context/admin-context';
import { incrementScanCount, incrementVisitorCount } from '@/lib/firebase-actions';
import { GoProPage } from '@/components/pro/go-pro-page';
import { FakeImageDetectorPage } from '@/components/fake-image-detector/fake-image-detector-page';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

type ScanStatus = 'idle' | 'scanning' | 'success' | 'error';
type View = 'home' | 'history' | 'community' | 'about' | 'admin' | 'admin-login' | 'pro' | 'screenshot' | 'fake-image-detector';

export default function Home() {
  const [status, setStatus] = useState<ScanStatus>('idle');
  const [result, setResult] = useState<ScanResult | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [communityOpen, setCommunityOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const { addHistoryItem } = useHistory();
  const { toast } = useToast();
  const [currentView, setCurrentView] = useState<View>('home');
  const [prefilledReport, setPrefilledReport] = useState<Partial<ReportFormData> | null>(null);
  const { isAdmin } = useAdmin();
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    incrementVisitorCount();
  }, []);

  const handleScan = async (text: string) => {
    if (!text.trim()) return;

    setStatus('scanning');
    setResult(null);

    const scanResult = await scanMessage(text);
    
    if (scanResult.error) {
      toast({
        variant: 'destructive',
        title: 'Scan Error',
        description: scanResult.error,
      });
      setStatus('error');
    } else {
      setResult(scanResult);
      addHistoryItem(scanResult);
      setStatus('success');
      incrementScanCount();
    }
  };

  const handleImageScan = async () => {
    if (!imagePreview) return;

    setStatus('scanning');
    setResult(null);

    const scanResult = await scanImage(imagePreview);
    
    if (scanResult.error) {
      toast({
        variant: 'destructive',
        title: 'Scan Error',
        description: scanResult.error,
      });
      setStatus('error');
    } else {
      setResult(scanResult);
      addHistoryItem(scanResult);
      setStatus('success');
      incrementScanCount();
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 4 * 1024 * 1024) { // 4MB limit
        toast({
          variant: 'destructive',
          title: 'File too large',
          description: 'Please upload an image smaller than 4MB.',
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };
  
  const getBackgroundColor = () => {
    if (status === 'success' && result) {
      return result.isMalicious
        ? 'bg-destructive/80'
        : 'bg-accent/20';
    }
    return 'bg-transparent';
  };

  const handleReset = () => {
    setStatus('idle');
    setResult(null);
    setCurrentView('home');
    setImagePreview(null);
  };
  
  const handleWarnCommunity = () => {
    if (result && result.isMalicious) {
      setPrefilledReport({
        title: 'Warning',
        url: result.url,
        rating: 1,
        comment: '',
      });
      setCurrentView('community');
    }
  };
  
  const handleAdminClick = () => {
    if (isAdmin) {
      setCurrentView('admin');
    } else {
      setCurrentView('admin-login');
    }
  };

  const renderContent = () => {
    // These views have their own content and don't need the main scan form/result display
    if (status !== 'idle' && status !== 'scanning') {
      return null;
    }

    switch (currentView) {
      case 'history':
        return <HistoryPage />;
      case 'community':
        return <CommunityPage prefilledReport={prefilledReport} onFormSubmit={() => setPrefilledReport(null)} />;
      case 'about':
        return <AboutPage />;
      case 'pro':
        return <GoProPage />;
      case 'fake-image-detector':
        return <FakeImageDetectorPage />;
      case 'admin-login':
        return <AdminLogin onLoginSuccess={() => setCurrentView('admin')} />;
      case 'admin':
        return isAdmin ? <AdminPage /> : <AdminLogin onLoginSuccess={() => setCurrentView('admin')} />;
      case 'screenshot':
        return (
            <Card className="w-full max-w-3xl bg-card/30 backdrop-blur-lg border-primary/20 animate-in fade-in zoom-in-95">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl text-primary-foreground">
                  <ImageUp className="text-primary w-8 h-8" />
                  Scan Screenshot
                </CardTitle>
                <CardDescription>Upload an image containing a link. We'll find the link and scan it for threats.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative border-2 border-dashed border-muted-foreground/50 rounded-lg p-8 text-center space-y-2">
                  <Input
                    id="screenshot-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={status === 'scanning'}
                  />
                  {imagePreview ? (
                    <img src={imagePreview} alt="Screenshot preview" className="max-h-60 mx-auto rounded-md" />
                  ) : (
                    <div className="flex flex-col items-center justify-center space-y-2 text-muted-foreground">
                      <ImageUp className="w-12 h-12" />
                      <p>Click to upload or drag & drop an image</p>
                      <p className="text-xs">(Max 4MB)</p>
                    </div>
                  )}
                </div>
                <Button
                  onClick={handleImageScan}
                  className="w-full"
                  disabled={!imagePreview || status === 'scanning'}
                >
                  {status === 'scanning' ? (
                    <Loader2 className="animate-spin mr-2 h-6 w-6" />
                  ) : (
                    'Find Link and Scan'
                  )}
                </Button>
              </CardContent>
            </Card>
        );
      case 'home':
      default:
        return (
            <>
              <div className="relative w-full max-w-3xl text-center space-y-2">
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <Image
                      src="/logo.gif"
                      alt="Background Logo"
                      width={150}
                      height={150}
                      unoptimized
                      className="opacity-10"
                    />
                  </div>
                  <h2 className="relative text-5xl md:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent py-2 bg-[length:200%_auto] animate-background-pan" style={{ textShadow: '0 0 10px hsl(var(--primary) / 0.5), 0 0 20px hsl(var(--accent) / 0.5)' }}>SENTINEL SCAN</h2>
                  <p className="relative text-lg md:text-xl text-muted-foreground">
                      GRAVEYARD OF SCAMMMERS
                  </p>
              </div>
              <ScanForm onScan={handleScan} loading={status === 'scanning'} />
              <MagicBento onCardClick={setCurrentView} />
            </>
        );
    }
  }

  const showHomeButton = currentView !== 'home' || (status !== 'idle' && status !== 'scanning');

  return (
    <div className={`min-h-screen w-full relative transition-colors duration-1000 ${getBackgroundColor()}`}>
      <BackgroundAnimation />
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header 
          onHistoryClick={() => setHistoryOpen(true)} 
          onCommunityClick={() => setCommunityOpen(true)} 
          onAboutClick={() => setAboutOpen(true)}
          onAdminClick={handleAdminClick}
        />
        <main className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center justify-start gap-12">
          {showHomeButton && (
            <div className="w-full max-w-3xl flex justify-start">
                <Button onClick={handleReset} variant="outline" className="bg-card/50 backdrop-blur-sm cursor-target">
                    <HomeIcon className="mr-2 h-4 w-4"/>
                    Home
                </Button>
            </div>
          )}

          {renderContent()}
          
          {(status === 'success' || status === 'error') && 
            <ScanResultDisplay result={result} status={status} onWarnCommunity={handleWarnCommunity} />
          }

        </main>
        <footer className="text-center p-4 text-muted-foreground text-sm">
          POWERED BY AXRN. Stay Safe Online.
        </footer>
      </div>

      <HistorySheet open={historyOpen} onOpenChange={setHistoryOpen} />
      <CommunitySheet open={communityOpen} onOpenChange={setCommunityOpen} />
      <AboutSheet open={aboutOpen} onOpenChange={setAboutOpen} />
    </div>
  );
}
