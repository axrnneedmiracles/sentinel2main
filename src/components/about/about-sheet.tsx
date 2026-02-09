'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Info, Mail, Phone } from 'lucide-react';
import { Separator } from '../ui/separator';

interface AboutSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AboutSheet({ open, onOpenChange }: AboutSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md bg-card/30 backdrop-blur-lg border-primary/20">
        <SheetHeader className="text-left mb-4">
          <SheetTitle className="flex items-center gap-2">
            <Info className="text-primary" />
            About Sentinel Scan
          </SheetTitle>
          <SheetDescription>
            Making the internet a safer place, one scan at a time.
          </SheetDescription>
        </SheetHeader>
        
        <div className="space-y-6 text-sm text-foreground/90">
            <p>
                Hi, I’m Aryan, the creator of Sentinel Scan — a project I’ve built solo with the goal of making the internet a safer place.
            </p>
            <p>
                Sentinel Scan is designed to analyze messages and links to detect potentially malicious or suspicious content, helping users stay safe from scams, phishing, and harmful sites. I believe everyone deserves to browse, chat, and share safely.
            </p>

            <Separator />

            <div className="space-y-4">
                <h3 className="font-semibold text-base text-primary">Get In Touch</h3>
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
            
            <p className="text-center font-bold text-lg text-primary-foreground pt-4">
                Stay safe. Stay aware.
            </p>
             <p className="text-center text-muted-foreground">— Aryan</p>
        </div>

      </SheetContent>
    </Sheet>
  );
}
