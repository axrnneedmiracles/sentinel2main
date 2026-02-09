'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/unified-link-analysis.ts';
import '@/ai/flows/malicious-link-detection.ts';
import '@/ai/flows/link-safety-feedback.ts';
import '@/ai/flows/image-analysis.ts';
import '@/ai/flows/text-to-speech.ts';
import '@/ai/flows/send-email-otp.ts';
import '@/ai/flows/suspicious-text-analysis.ts';
import '@/ai/flows/identity-breach-check.ts';
import '@/ai/flows/image-forensics-analysis.ts';

    
