'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Image as ImageIcon, Loader2, Bot, Database } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import ExifReader from 'exifreader';
import { analyzeImageVisually } from '@/lib/actions';
import { Progress } from '../ui/progress';

// Define structures for the results
interface AnalysisResult {
  score: number;
  reasons: string[];
}

export function FakeImageDetectorPage() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [fullMetadata, setFullMetadata] = useState<any>(null);
  const [status, setStatus] = useState<'idle' | 'scanning' | 'done'>('idle');
  const { toast } = useToast();

  // State for each analysis step
  const [metadataResult, setMetadataResult] = useState<AnalysisResult | null>(null);
  const [visionResult, setVisionResult] = useState<AnalysisResult | null>(null);
  const [finalResult, setFinalResult] = useState<{ score: number; verdict: string; verdictColor: string} | null>(null);

  const resetState = () => {
    setImageFile(null);
    setImagePreview(null);
    setFullMetadata(null);
    setStatus('idle');
    setMetadataResult(null);
    setVisionResult(null);
    setFinalResult(null);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        toast({ variant: 'destructive', title: 'File too large', description: 'Please select an image under 15MB.' });
        return;
      }
      resetState();
      setImageFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeMetadata = async (file: File): Promise<AnalysisResult> => {
    try {
        const buffer = await file.arrayBuffer();
        const allMeta = ExifReader.load(buffer, { expanded: true });
        setFullMetadata(allMeta);

        // Standardize access to metadata fields
        const getMetaField = (obj: any, field: string): string => {
            const tag = obj[field];
            if (!tag) return '';
            // Handle different ExifReader structures
            if (typeof tag.description === 'string') {
                return tag.description.toLowerCase();
            }
            if (typeof tag === 'string') {
                return tag.toLowerCase();
            }
            return '';
        };

        const software = getMetaField(allMeta, 'Software');
        const make = getMetaField(allMeta, 'Make');
        const model = getMetaField(allMeta, 'Model');
        const userComment = (allMeta.UserComment?.description || allMeta.user?.comment || '').toLowerCase();

        // --- Define Indicators ---
        const aiSoftwareKeywords = ["photoshop", "firefly", "dalle", "stable diffusion", "midjourney", "openai", "generative", "ai"];
        const allCameraBrands = ["apple", "google", "samsung", "oneplus", "xiaomi", "iqoo", "vivo", "oppo", "realme", "pixel", "canon", "nikon", "sony", "fujifilm", "panasonic", "leica", "olympus", "hasselblad"];

        // --- Check for Evidence ---
        const foundAiKeyword = aiSoftwareKeywords.find(keyword => software.includes(keyword) || userComment.includes(keyword));
        const foundCameraBrand = allCameraBrands.find(brand => make.includes(brand) || model.includes(brand));
        
        // Weaker evidence signals
        const hasLensData = !!allMeta.LensModel?.description;
        const hasFocalLength = !!allMeta.FocalLength?.description;
        const hasExposureTime = !!allMeta.ExposureTime?.description;
        const hasGpsData = !!allMeta.gps;

        let score: number;
        let reasons: string[];

        // --- New Decision Logic ---
        if (foundCameraBrand) {
            // Strong evidence of a real camera exists.
            if (foundAiKeyword) {
                // Case 1: Conflicting evidence. Real photo edited with AI.
                score = 75;
                reasons = [
                    `⚠️ Mixed Metadata: Contains a real camera brand ('${foundCameraBrand}') but also mentions AI software ('${foundAiKeyword}').`,
                    "This is likely a real photograph that has been edited or processed with AI tools."
                ];
            } else {
                // Case 2: Strong evidence of real photo, no AI evidence.
                score = 5;
                reasons = [
                    `📸 Real Photo Detected: The metadata includes the camera brand '${foundCameraBrand}'.`,
                    (hasLensData || hasFocalLength) ? "Lens and focal length data further support this." : "This is a strong indicator of an authentic photograph."
                ];
            }
        } else if (foundAiKeyword) {
            // Case 3: Strong evidence of AI, no real camera brand.
            score = 95;
            reasons = [
                `🤖 AI Generated: Metadata includes the term '${foundAiKeyword}', which is associated with AI image generation.`,
                "No recognized camera brand was found in the metadata."
            ];
        } else {
            // Case 4: Ambiguous. No strong evidence either way. Fall back to weaker signals.
            if (hasLensData || hasFocalLength || hasExposureTime || hasGpsData) {
                 score = 30; // Low suspicion
                 reasons = [
                     "❓ Ambiguous, but likely real: The image contains some camera setting metadata (like lens, focal length, or GPS), but not a recognized brand.",
                     "This could be from a less common device or edited metadata."
                 ];
            } else {
                 score = 65; // Moderate suspicion
                 reasons = [
                     "❓ Ambiguous, leaning suspicious: No identifiable camera brand or specific camera settings were found.",
                     "This lack of data is common for images downloaded from social media or created by AI generators."
                 ];
            }
        }
        
        return { score, reasons };

    } catch (err) {
        console.error(err);
        toast({ variant: 'destructive', title: 'Metadata Error', description: 'Could not read metadata from the image.' });
        return { score: 50, reasons: ['Failed to read metadata.'] };
    }
  };

  const handleHybridScan = async () => {
    if (!imageFile || !imagePreview) return;
    
    setStatus('scanning');
    setMetadataResult(null);
    setVisionResult(null);
    setFinalResult(null);

    // Run both analyses in parallel
    const [metadataRes, visionRes] = await Promise.all([
      analyzeMetadata(imageFile),
      analyzeImageVisually(imagePreview)
    ]);

    setMetadataResult(metadataRes);
    setVisionResult(visionRes);

    if (visionRes.error) {
      toast({ variant: 'destructive', title: 'Vision API Error', description: visionRes.error });
    }

    const finalScore = Math.round(visionRes.score * 0.7 + metadataRes.score * 0.3);
    
    let verdict = "🟩 Likely a Real Photograph";
    let verdictColor = "bg-accent/20";
    if (finalScore > 70) {
        verdict = "🟥 HIGH probability AI-generated";
        verdictColor = "bg-destructive/20";
    } else if (finalScore > 40) {
        verdict = "🟨 POSSIBLY AI-generated";
        verdictColor = "bg-primary/20";
    }

    setFinalResult({ score: finalScore, verdict, verdictColor });
    setStatus('done');
  };

  return (
    <div className="w-full max-w-3xl animate-in fade-in zoom-in-95 space-y-8">
      <Card className="bg-card/30 backdrop-blur-lg border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl text-primary-foreground">
            <ImageIcon className="text-primary w-8 h-8" />
            Hybrid Image Analyzer
          </CardTitle>
          <CardDescription>Combines metadata forensics and AI visual analysis to detect generated images.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative border-2 border-dashed border-muted-foreground/50 rounded-lg p-8 text-center space-y-2">
            <Input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={status === 'scanning'}
            />
            {imagePreview ? (
              <img src={imagePreview} alt="Image preview" className="max-h-60 mx-auto rounded-md" />
            ) : (
              <div className="flex flex-col items-center justify-center space-y-2 text-muted-foreground">
                <ImageIcon className="w-12 h-12" />
                <p>Click to upload or drag & drop</p>
                <p className="text-xs">(Max 15MB)</p>
              </div>
            )}
          </div>
          <Button onClick={handleHybridScan} disabled={!imageFile || status === 'scanning'} className="w-full">
            {status === 'scanning' ? <><Loader2 className="animate-spin mr-2" />Analyzing...</> : 'Perform Hybrid Scan'}
          </Button>

          {status === 'scanning' && (
              <div className="pt-4 space-y-2">
                  <Progress value={visionResult ? 100 : (metadataResult ? 50 : 10)} className="w-full" />
                  <p className="text-sm text-center text-muted-foreground">
                      {visionResult ? 'Finalizing...' : (metadataResult ? 'Performing AI visual analysis...' : 'Analyzing metadata...')}
                  </p>
              </div>
          )}

          {status === 'done' && finalResult && (
            <div className="space-y-6 pt-4">
              <div className={`text-center p-4 rounded-lg ${finalResult.verdictColor}`}>
                <p className="font-bold text-xl">{finalResult.verdict}</p>
                <p>Final Confidence Score: <span className="font-bold text-2xl">{finalResult.score}%</span></p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {metadataResult && (
                      <Card className="bg-background/50">
                          <CardHeader>
                              <CardTitle className="flex items-center gap-2 text-lg"><Database className="w-5 h-5 text-primary"/>Metadata Analysis</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2">
                              <p className="font-bold text-primary-foreground text-center text-3xl">{metadataResult.score}%</p>
                              <p className="text-xs text-center text-muted-foreground">AI Confidence</p>
                              <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground pt-2">
                                  {metadataResult.reasons.map((reason, i) => <li key={i}>{reason}</li>)}
                              </ul>
                          </CardContent>
                      </Card>
                  )}
                  {visionResult && (
                      <Card className="bg-background/50">
                           <CardHeader>
                              <CardTitle className="flex items-center gap-2 text-lg"><Bot className="w-5 h-5 text-primary"/>AI Visual Analysis</CardTitle>
                          </CardHeader>
                           <CardContent className="space-y-2">
                              <p className="font-bold text-primary-foreground text-center text-3xl">{visionResult.score}%</p>
                               <p className="text-xs text-center text-muted-foreground">AI Confidence</p>
                              <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground pt-2">
                                  {visionResult.reasons.length > 0 ? visionResult.reasons.map((reason, i) => <li key={i}>{reason}</li>) : <li>No specific visual artifacts found.</li>}
                              </ul>
                          </CardContent>
                      </Card>
                  )}
              </div>

              {fullMetadata && (
                   <Accordion type="single" collapsible className="w-full">
                       <AccordionItem value="item-1">
                          <AccordionTrigger>View Full Metadata</AccordionTrigger>
                          <AccordionContent className="text-muted-foreground whitespace-pre-wrap text-xs max-h-60 overflow-y-auto bg-black/20 p-2 rounded">
                            {Object.entries(fullMetadata).map(([tagType, tags]: [string, any]) => (
                              <div key={tagType}>
                                {typeof tags === 'object' && tags !== null && Object.keys(tags).length > 0 && (
                                  <>
                                    <h4 className="font-bold text-primary-foreground mt-2 -ml-2">{tagType}</h4>
                                    {Object.entries(tags).map(([key, val]: [string, any]) => (
                                      <div key={key} className="flex hover:bg-white/10">
                                          <b className="w-1/3 break-words font-light text-white/70">{key}</b>
                                          <span className="w-2/3 break-words font-mono">: {val.description || val.value?.toString()}</span>
                                      </div>
                                    ))}
                                  </>
                                )}
                              </div>
                            ))}
                          </AccordionContent>
                      </AccordionItem>
                   </Accordion>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
