
'use client';

import type { ScanResult } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { RiskMeter } from './risk-meter';
import { ShieldAlert, ShieldCheck, Info, AlertTriangle, LifeBuoy, Users } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { Button } from '../ui/button';

interface ScanResultProps {
  result: ScanResult | null;
  status: 'idle' | 'scanning' | 'success' | 'error';
  onWarnCommunity: () => void;
}

const ResultCard: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
  <Card className={`w-full max-w-3xl bg-card/30 backdrop-blur-lg border-2 shadow-2xl animate-in fade-in zoom-in-95 ${className}`}>
    {children}
  </Card>
);

export function ScanResultDisplay({ result, status, onWarnCommunity }: ScanResultProps) {
  if (status === 'scanning') {
    return (
      <ResultCard className="border-primary/50">
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </ResultCard>
    );
  }

  if (status === 'error' || (status === 'success' && !result)) {
    return null; // Error is handled by toast
  }

  if (status !== 'success' || !result) {
    return null;
  }

  if (result.isMalicious) {
    return (
      <ResultCard className="border-destructive">
        <CardHeader className="text-center items-center">
          <ShieldAlert className="w-16 h-16 text-destructive" />
          <CardTitle className="text-3xl font-bold text-destructive">Threat Detected</CardTitle>
          <CardDescription className="text-destructive/80 text-base">This link is potentially harmful.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <RiskMeter score={result.riskScore} />
          <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-lg font-semibold"><Info className="mr-2 text-primary" />Analysis</AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground">{result.explanation}</AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger className="text-lg font-semibold"><AlertTriangle className="mr-2 text-destructive" />What To Do</AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground">{result.recommendedActions}</AccordionContent>
            </AccordionItem>
            {result.advice && (
               <AccordionItem value="item-3">
                <AccordionTrigger className="text-lg font-semibold"><LifeBuoy className="mr-2 text-accent" />Clicked Already?</AccordionTrigger>
                <AccordionContent className="text-base text-muted-foreground">{result.advice}</AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        </CardContent>
        <CardFooter>
          <Button onClick={onWarnCommunity} className="w-full cursor-target" variant="secondary">
            <Users className="mr-2 h-4 w-4" />
            Warn others in community
          </Button>
        </CardFooter>
      </ResultCard>
    );
  }

  return (
    <ResultCard className="border-accent">
      <CardHeader className="text-center items-center">
        <ShieldCheck className="w-16 h-16 text-accent" />
        <CardTitle className="text-3xl font-bold text-accent">Link is Safe</CardTitle>
        <CardDescription className="text-accent/80 text-base">No immediate threats were found.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
         <RiskMeter score={result.riskScore} />
         <div className="text-center p-4 bg-background/30 rounded-lg">
          <p className="font-semibold">Scanned URL:</p>
          <p className="text-muted-foreground break-all">{result.url}</p>
         </div>
      </CardContent>
    </ResultCard>
  );
}
