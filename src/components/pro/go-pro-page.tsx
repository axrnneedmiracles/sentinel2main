
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { usePro } from '@/context/pro-context';
import { Star, Zap, Mic, ShieldAlert, Mail, HomeIcon, Loader2, LogOut, ShieldCheck, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { useToast } from '@/hooks/use-toast';
import { sendOtp, analyzeText, checkIdentity } from '@/lib/actions';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";


const ProFeaturesIntro = ({ onUpgradeClick }: { onUpgradeClick: () => void }) => (
    <Card className="w-full max-w-3xl bg-card/30 backdrop-blur-lg border-primary/20 animate-in fade-in zoom-in-95">
      <CardHeader className="text-center items-center space-y-4">
        <div className="flex justify-center items-center">
            <Star className="text-yellow-400 w-12 h-12" fill="currentColor" />
        </div>
        <CardTitle className="text-3xl font-extrabold text-primary-foreground">Sentinel Pro</CardTitle>
        <CardDescription className="text-lg text-muted-foreground max-w-md">
          Upgrade to unlock advanced protection and gain peace of mind with our most powerful security features.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
              { icon: <Zap className="text-primary" />, title: 'Real-time Browser Protection', description: 'A browser extension that scans links before you click.', badge: "Coming Soon" },
              { icon: <Mic className="text-primary" />, title: 'Voice-Activated Scanning', description: 'Scan suspicious phrases by simply speaking to the app.' },
              { icon: <ShieldAlert className="text-primary" />, title: 'Proactive Identity Monitoring', description: 'Get alerted if your credentials are found in a data breach.' },
              { icon: <Mail className="text-primary" />, title: 'AI Email Gateway', description: 'Forward suspicious emails to a private address for analysis.' },
          ].map((feature, index) => (
            <div key={index} className="flex flex-col items-center text-center p-4 rounded-lg bg-background/50">
              <div className="p-3 bg-primary/20 rounded-full mb-4">
                {feature.icon}
              </div>
              <h3 className="font-semibold text-primary-foreground mb-1">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
               {feature.badge && <Badge variant="secondary" className="mt-2">{feature.badge}</Badge>}
            </div>
          ))}
        </div>
        <div className="text-center">
          <Button size="lg" className="text-lg cursor-target" onClick={onUpgradeClick}>
            <Star className="mr-2" />
            Upgrade Now
          </Button>
        </div>
      </CardContent>
    </Card>
);

const EmailStep = ({ onOtpSent }: { onOtpSent: (email: string, otp: string) => void }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleSendEmail = async () => {
        setLoading(true);
        try {
            const { otp, error } = await sendOtp(email);
            if (otp) {
                toast({ title: 'OTP Sent', description: `For this demo, the OTP is ${otp}. In a real app, this would be emailed.` });
                onOtpSent(email, otp);
            } else {
                throw new Error(error || "Failed to get OTP from server.");
            }
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message || 'Could not send OTP. Please try again.' });
        }
        setLoading(false);
    };

    return (
      <div className="space-y-4 text-center">
        <h3 className="text-xl font-semibold text-primary-foreground">Enter your Email</h3>
        <Input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-input text-center text-lg"
            disabled={loading}
        />
        <Button onClick={handleSendEmail} disabled={loading || !email} className="w-full">
            {loading ? <Loader2 className="animate-spin" /> : 'Send OTP'}
        </Button>
      </div>
    );
};

const OtpStep = ({ email, serverOtp, onVerified }: { email: string; serverOtp: string; onVerified: () => void }) => {
    const [userOtp, setUserOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const { login } = usePro();

    const handleVerify = () => {
        setLoading(true);
        // Simulate network delay
        setTimeout(() => {
            if (userOtp === serverOtp) {
                toast({ title: "Email Verified!", description: "You're one step closer to Pro." });
                login(email);
                onVerified();
            } else {
                toast({ variant: 'destructive', title: 'Invalid OTP', description: 'The OTP you entered is incorrect.' });
            }
            setLoading(false);
        }, 500);
    };

    return (
        <div className="space-y-4 text-center">
            <h3 className="text-xl font-semibold text-primary-foreground">Enter OTP</h3>
            <p className="text-sm text-muted-foreground">An OTP has been sent to {email}.</p>
            <Input
                type="text"
                placeholder="••••••"
                value={userOtp}
                onChange={(e) => setUserOtp(e.target.value)}
                className="bg-input text-center tracking-widest text-2xl"
                disabled={loading}
                maxLength={6}
            />
            <Button onClick={handleVerify} disabled={loading || userOtp.length !== 6} className="w-full">
                {loading ? <Loader2 className="animate-spin" /> : 'Verify and Proceed'}
            </Button>
        </div>
    );
};


const RedeemCodeStep = ({ onRedeemed }: { onRedeemed: () => void }) => {
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const { redeemProStatus } = usePro();

    const handleRedeem = () => {
        setLoading(true);
        setTimeout(() => {
            if (code.toLowerCase() === 'sentinelaxrn') {
                redeemProStatus();
                toast({ title: "Code Redeemed!", description: "Welcome to Sentinel Pro!" });
                onRedeemed();
            } else {
                toast({ variant: 'destructive', title: 'Invalid Code', description: 'The redeem code is incorrect.' });
            }
            setLoading(false);
        }, 500);
    };

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-semibold text-center text-primary-foreground">Enter Your Redeem Code</h3>
            <Input
                type="text"
                placeholder="••••••••••"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="bg-input text-center tracking-widest text-xl"
                disabled={loading}
            />
            <Button onClick={handleRedeem} disabled={loading || !code} className="w-full">
                {loading ? 'Redeeming...' : 'Unlock Pro'}
            </Button>
        </div>
    );
};

const ProDashboard = () => {
    const { userEmail, logout } = usePro();
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [voiceAnalysisResult, setVoiceAnalysisResult] = useState<{ isSuspicious: boolean; analysis: string; } | null>(null);
    const [isVoiceScanning, setIsVoiceScanning] = useState(false);
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const { toast } = useToast();
    const recognitionRef = useRef<any>(null);

    const [identityEmail, setIdentityEmail] = useState('');
    const [identityLoading, setIdentityLoading] = useState(false);
    const [identityResult, setIdentityResult] = useState<{ isBreached: boolean; breachDetails: string } | null>(null);

    const [isCheckingEmail, setIsCheckingEmail] = useState(false);
    const [emailText, setEmailText] = useState('');
    const [emailGatewayResult, setEmailGatewayResult] = useState<{ isSuspicious: boolean; analysis: string } | null>(null);


    const handleVoiceAnalysis = useCallback(async (text: string) => {
        if (!text.trim()) return;
        setIsVoiceScanning(true);
        setVoiceAnalysisResult(null);
        setIsAlertOpen(true);
        const analysisResult = await analyzeText(text);
        if (analysisResult.error) {
            setVoiceAnalysisResult({ isSuspicious: true, analysis: analysisResult.error });
        } else {
            setVoiceAnalysisResult(analysisResult);
        }
        setIsVoiceScanning(false);
    }, []);
    
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            
            recognition.onresult = (event: any) => {
                let interimTranscript = '';
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }
                setTranscript(finalTranscript || interimTranscript);
                if(finalTranscript){
                    handleVoiceAnalysis(finalTranscript);
                    recognition.stop();
                }
            };

            recognition.onerror = (event: any) => {
                toast({ variant: 'destructive', title: 'Voice Error', description: event.error });
                setIsListening(false);
            };
            
            recognition.onend = () => {
                setIsListening(false);
            };

            recognitionRef.current = recognition;
        } else {
             toast({ variant: 'destructive', title: 'Unsupported', description: "Your browser doesn't support voice recognition." });
        }

        return () => {
            recognitionRef.current?.stop();
        };
    }, [toast, handleVoiceAnalysis]);

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
        } else {
            setTranscript('');
            setVoiceAnalysisResult(null);
            recognitionRef.current?.start();
        }
        setIsListening(!isListening);
    };

    const handleIdentityCheck = async () => {
        if (!identityEmail) return;
        setIdentityLoading(true);
        setIdentityResult(null);
        const result = await checkIdentity(identityEmail);
        if (result.error) {
            toast({ variant: 'destructive', title: 'Error', description: result.error });
        } else {
            setIdentityResult(result);
        }
        setIdentityLoading(false);
    };

    const handleEmailTextAnalysis = async () => {
        if (!emailText) return;
        setIsCheckingEmail(true);
        setEmailGatewayResult(null);
        
        const result = await analyzeText(emailText);
        
        if (result.error) {
            toast({ variant: 'destructive', title: 'Error', description: result.error });
        } else {
            setEmailGatewayResult(result);
        }
        setIsCheckingEmail(false);
    };

    const handleAlertOpenChange = (open: boolean) => {
        setIsAlertOpen(open);
    };
    
    const simulatedGatewayAddress = `scan.${userEmail?.split('@')[0] || 'user'}@sentinel.pro`;

    return (
        <div className="w-full max-w-3xl space-y-8 animate-in fade-in-50">
            <Card className="bg-card/30 backdrop-blur-lg border-primary/20">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-2xl text-primary-foreground">
                            <Star className="text-yellow-400 fill-current" /> Sentinel Pro Dashboard
                        </CardTitle>
                        <CardDescription>Welcome, {userEmail || 'Pro User'}.</CardDescription>
                    </div>
                    <Button variant="ghost" onClick={logout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                    </Button>
                </CardHeader>
            </Card>

            <Tabs defaultValue="voice" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-card/50 backdrop-blur-lg border-primary/20">
                    <TabsTrigger value="voice"><Mic className="mr-2 h-4 w-4" />Voice</TabsTrigger>
                    <TabsTrigger value="identity"><ShieldAlert className="mr-2 h-4 w-4" />Identity</TabsTrigger>
                    <TabsTrigger value="email"><Mail className="mr-2 h-4 w-4" />Email</TabsTrigger>
                </TabsList>
                <TabsContent value="voice">
                    <Card className="bg-card/30 backdrop-blur-lg border-primary/20 mt-4">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg text-primary-foreground">
                                <Mic /> Voice Analysis
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center justify-center space-y-4">
                            <Button
                                size="icon"
                                className={`w-24 h-24 rounded-full transition-all duration-300 ${isListening ? 'bg-destructive animate-pulse' : 'bg-primary'}`}
                                onClick={toggleListening}
                            >
                                <Mic className="w-12 h-12" />
                            </Button>
                            <div className="text-center min-h-[4rem] flex flex-col items-center justify-center p-2 bg-background/30 rounded-md w-full">
                                <p className="text-muted-foreground break-words max-w-full min-h-[2rem] px-2 whitespace-pre-wrap">
                                    {isListening ? (transcript || "Listening...") : "Tap to start voice analysis"}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                    <AlertDialog open={isAlertOpen} onOpenChange={handleAlertOpenChange}>
                        <AlertDialogContent>
                            {isVoiceScanning ? (
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="flex items-center gap-2">
                                        <Loader2 className="animate-spin" />
                                        Scanning...
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Analyzing transcribed text for suspicious content.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                            ) : voiceAnalysisResult ? (
                                <AlertDialogHeader>
                                     <AlertDialogTitle className={`flex items-center gap-2 ${voiceAnalysisResult.isSuspicious ? 'text-destructive' : 'text-accent'}`}>
                                        {voiceAnalysisResult.isSuspicious ? <ShieldAlert /> : <ShieldCheck />}
                                        {voiceAnalysisResult.isSuspicious ? 'Threat Detected' : 'Looks Safe'}
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                        {voiceAnalysisResult.analysis}
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                            ) : null}
                            <AlertDialogFooter>
                                <AlertDialogAction onClick={() => setIsAlertOpen(false)}>Close</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </TabsContent>
                <TabsContent value="identity">
                     <Card className="bg-card/30 backdrop-blur-lg border-primary/20 mt-4">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg text-primary-foreground">
                            <ShieldAlert /> Proactive Identity Monitoring
                            </CardTitle>
                            <CardDescription>Interactive Demo</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-muted-foreground text-sm">Enter an email to check our (simulated) database of breached credentials. Try "breached@example.com".</p>
                            <div className="flex gap-2">
                                <Input placeholder="your.email@example.com" value={identityEmail} onChange={(e) => setIdentityEmail(e.target.value)} disabled={identityLoading} />
                                <Button onClick={handleIdentityCheck} disabled={identityLoading || !identityEmail}>
                                    {identityLoading ? <Loader2 className="animate-spin" /> : <ShieldCheck />}
                                </Button>
                            </div>
                            {identityResult && (
                                <div className={`mt-4 p-3 rounded-md text-sm flex items-center gap-2 ${identityResult.isBreached ? 'bg-destructive/20 text-destructive-foreground' : 'bg-accent/20 text-accent-foreground'}`}>
                                    {identityResult.isBreached ? <AlertCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                                    <p>{identityResult.breachDetails}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="email">
                    <Card className="bg-card/30 backdrop-blur-lg border-primary/20 mt-4">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg text-primary-foreground">
                                <Mail /> AI Email Gateway
                            </CardTitle>
                            <CardDescription>Interactive Demo</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-muted-foreground text-sm">In a real app, you'd forward emails to the address below. For this demo, paste the body of a suspicious email to have it analyzed.</p>
                            <Input value={simulatedGatewayAddress} readOnly className="bg-input/50 text-center text-xs" />
                            <Textarea
                                placeholder="Paste email content here..."
                                value={emailText}
                                onChange={(e) => setEmailText(e.target.value)}
                                className="bg-input"
                                rows={6}
                                disabled={isCheckingEmail}
                            />
                            <Button className="w-full" onClick={handleEmailTextAnalysis} disabled={isCheckingEmail || !emailText.trim()}>
                                {isCheckingEmail ? <Loader2 className="animate-spin" /> : "Analyze Email Content"}
                            </Button>
                            {emailGatewayResult && (
                                <div className={`mt-4 p-3 rounded-md text-sm flex items-center gap-2 ${emailGatewayResult.isSuspicious ? 'bg-destructive/20 text-destructive-foreground' : 'bg-accent/20 text-accent-foreground'}`}>
                                    {emailGatewayResult.isSuspicious ? <AlertCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                                    <div>
                                        <p className="font-bold">AI Analysis:</p>
                                        <p>{emailGatewayResult.analysis}</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export function GoProPage() {
    const { isPro, userEmail } = usePro();
    const [step, setStep] = useState<'intro' | 'email' | 'otp' | 'redeem'>('intro');
    const [email, setEmail] = useState('');
    const [serverOtp, setServerOtp] = useState('');

    const handleOtpSent = (sentEmail: string, otp: string) => {
        setEmail(sentEmail);
        setServerOtp(otp);
        setStep('otp');
    }

    const handleVerified = () => {
        setStep('redeem');
    }

    if (isPro && userEmail) {
        return <ProDashboard />;
    }

    const renderStep = () => {
        switch (step) {
            case 'intro':
                return <ProFeaturesIntro onUpgradeClick={() => setStep('email')} />;
            case 'email':
                return (
                     <Card className="w-full max-w-sm bg-card/30 backdrop-blur-lg border-primary/20">
                        <CardHeader>
                             <Button variant="ghost" size="icon" className="absolute top-4 left-4" onClick={() => setStep('intro')}>
                                <HomeIcon />
                             </Button>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <EmailStep onOtpSent={handleOtpSent} />
                        </CardContent>
                    </Card>
                );
            case 'otp':
                return (
                     <Card className="w-full max-w-sm bg-card/30 backdrop-blur-lg border-primary/20">
                        <CardHeader>
                             <Button variant="ghost" size="icon" className="absolute top-4 left-4" onClick={() => setStep('email')}>
                                <HomeIcon />
                             </Button>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <OtpStep email={email} serverOtp={serverOtp} onVerified={handleVerified} />
                        </CardContent>
                    </Card>
                );
            case 'redeem':
                return (
                     <Card className="w-full max-w-sm bg-card/30 backdrop-blur-lg border-primary/20">
                        <CardContent className="pt-6">
                            <RedeemCodeStep onRedeemed={() => {}} />
                        </CardContent>
                    </Card>
                );
            default:
                 return <ProFeaturesIntro onUpgradeClick={() => setStep('email')} />;
        }
    };

    return (
        <div className="w-full max-w-3xl flex justify-center animate-in fade-in zoom-in-95">
            {renderStep()}
        </div>
    );
}

// Add SpeechRecognition types to window for TypeScript
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}
    
