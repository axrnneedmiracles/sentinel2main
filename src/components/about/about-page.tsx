'use client';

import { Info, Mail, Phone } from 'lucide-react';
import { Separator } from '../ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

export function AboutPage() {
  return (
    <Card className="w-full max-w-3xl bg-card/30 backdrop-blur-lg border-primary/20 animate-in fade-in zoom-in-95">
        <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl text-primary-foreground">
                <Info className="text-primary w-8 h-8" />
                About Sentinel Scan
            </CardTitle>
        </CardHeader>
        <CardContent>
            <div className="space-y-6 text-base text-foreground/90">
                <p>
                    Hi, I’m Aryan, the creator of Sentinel Scan — a project I’ve built solo with the goal of making the internet a safer place.
                </p>
                <p>
                    Sentinel Scan is designed to analyze messages and links to detect potentially malicious or suspicious content, helping users stay safe from scams, phishing, and harmful sites. I believe everyone deserves to browse, chat, and share safely.
                </p>

                <Separator />

                <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-primary">Get In Touch</h3>
                    <p>If you experience any issues, have feedback, or want to collaborate, feel free to reach out:</p>
                    <a href="tel:8766233436" className="flex items-center gap-3 p-2 rounded-md hover:bg-primary/10 transition-colors cursor-target">
                        <Phone className="w-5 h-5 text-accent flex-shrink-0" />
                        <span className="text-primary-foreground">8766233436</span>
                    </a>
                    <a href="mailto:aryanshekharvats01@gmail.com" className="flex items-center gap-3 p-2 rounded-md hover:bg-primary/10 transition-colors cursor-target">
                        <Mail className="w-5 h-5 text-accent flex-shrink-0" />
                        <span className="text-primary-foreground">aryanshekharvats01@gmail.com</span>
                    </a>
                </div>

                <Separator />
                
                <p className="text-center font-bold text-xl text-primary-foreground pt-4">
                    Stay safe. Stay aware.
                </p>
                 <p className="text-center text-muted-foreground">— Aryan</p>
            </div>
        </CardContent>
    </Card>
  );
}
