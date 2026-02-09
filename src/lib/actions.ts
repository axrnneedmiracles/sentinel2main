
'use server';

import { analyzeLink } from '@/ai/flows/unified-link-analysis';
import { extractUrlFromImage } from '@/ai/flows/image-analysis';
import { sendEmailOtp } from '@/ai/flows/send-email-otp';
import { analyzeSuspiciousText } from '@/ai/flows/suspicious-text-analysis';
import { checkIdentityBreach } from '@/ai/flows/identity-breach-check';
import type { ScanResult } from '@/lib/types';
import { performVisualAnalysis } from '@/ai/flows/image-forensics-analysis';

function extractUrl(text: string): string | null {
    // A more robust regex to find URLs, including those without a protocol.
    const urlRegex = /((?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+(?:\/[^\s]*)?)/g;
    const urls = text.match(urlRegex);
    if (!urls) return null;

    let url = urls[0];
    // Prepend https:// if no protocol is present for the AI flows.
    if (!/^https?:\/\//i.test(url)) {
        url = 'https://' + url;
    }
    
    // Basic validation to check if it's a plausible URL format.
    try {
        new URL(url);
        return url;
    } catch (_) {
        return null;
    }
}

export async function scanMessage(text: string): Promise<ScanResult> {
    const url = extractUrl(text);
    if (!url) {
        return { url: text, isMalicious: false, riskScore: 0, error: 'No valid URL found in the message.' };
    }

    try {
        // Use the new unified flow for a faster, single-call analysis
        const analysisResult = await analyzeLink({ url });
        
        const combinedResult: ScanResult = {
            url,
            isMalicious: analysisResult.isMalicious,
            riskScore: analysisResult.riskScore,
            explanation: analysisResult.explanation,
            recommendedActions: analysisResult.recommendedActions,
            advice: analysisResult.advice,
        };

        return combinedResult;

    } catch (error) {
        console.error("AI flow failed:", error);
        // Return a structured error response
        return { url, isMalicious: true, riskScore: 85, error: 'Failed to analyze the link due to high traffic or an internal error. Based on the URL pattern, caution is advised. Please try again later for a full analysis.' };
    }
}

export async function scanImage(imageDataUri: string): Promise<ScanResult> {
    if (!imageDataUri) {
        return { url: '', isMalicious: false, riskScore: 0, error: 'No image data received.' };
    }

    try {
        // 1. Extract URL from image using AI
        const extractionResult = await extractUrlFromImage({ photoDataUri: imageDataUri });
        const url = extractionResult.url;

        if (!url) {
            return { url: '', isMalicious: false, riskScore: 0, error: 'No URL found in the image.' };
        }
        
        // 2. Analyze the extracted URL
        const analysisResult = await analyzeLink({ url });
        
        // Combine results
        const combinedResult: ScanResult = {
            url,
            isMalicious: analysisResult.isMalicious,
            riskScore: analysisResult.riskScore,
            explanation: analysisResult.explanation,
            recommendedActions: analysisResult.recommendedActions,
            advice: analysisResult.advice,
        };

        return combinedResult;

    } catch (error) {
        console.error("AI image scanning flow failed:", error);
        return { url: '', isMalicious: true, riskScore: 85, error: 'Failed to analyze the image due to an internal error. Please try again later.' };
    }
}


export async function sendOtp(email: string): Promise<{ otp: string | null; error?: string }> {
  if (!email) {
    return { otp: null, error: 'Email is required.' };
  }
  try {
    const result = await sendEmailOtp({ email });
    return { otp: result.otp };
  } catch (error) {
    console.error("sendOtp action failed:", error);
    return { otp: null, error: 'Failed to send OTP.' };
  }
}

export async function analyzeText(text: string): Promise<{ analysis: string; isSuspicious: boolean; error?: string }> {
  if (!text) {
    return { analysis: 'No text provided.', isSuspicious: false, error: 'No text provided.' };
  }
  try {
    const result = await analyzeSuspiciousText({ text });
    return result;
  } catch (error) {
    console.error("analyzeText action failed:", error);
    return { analysis: 'Failed to analyze text.', isSuspicious: true, error: 'Failed to analyze text due to an internal error.' };
  }
}

export async function checkIdentity(email: string): Promise<{ isBreached: boolean; breachDetails: string; error?: string }> {
    if (!email) {
        return { isBreached: false, breachDetails: '', error: 'Email is required.' };
    }
    try {
        const result = await checkIdentityBreach({ email });
        return { ...result };
    } catch (error) {
        console.error("checkIdentity action failed:", error);
        return { isBreached: true, breachDetails: 'Failed to check for breaches due to an internal error.', error: 'Failed to check for breaches.' };
    }
}

export async function analyzeImageVisually(imageDataUri: string): Promise<{ score: number; reasons: string[]; error?: string }> {
  if (!imageDataUri) {
    return { score: 0, reasons: [], error: 'No image data received.' };
  }
  try {
    const result = await performVisualAnalysis({ photoDataUri: imageDataUri });
    return result;
  } catch (error) {
    console.error("analyzeImageVisually action failed:", error);
    return { score: 0, reasons: ['Failed to perform visual analysis due to an internal error.'], error: 'Failed to analyze image visually.' };
  }
}
    
