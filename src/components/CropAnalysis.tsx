import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, Loader2, Camera } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import cropAnalysisImage from "@/assets/crop-analysis.jpg";

const MAX_IMAGE_SIZE = 800; // max width/height in px
const JPEG_QUALITY = 0.6;

function compressImage(dataUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > MAX_IMAGE_SIZE || height > MAX_IMAGE_SIZE) {
        const scale = MAX_IMAGE_SIZE / Math.max(width, height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas not supported"));
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", JPEG_QUALITY));
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = dataUrl;
  });
}

const ESTIMATED_SECONDS = 15;

export const CropAnalysis = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { toast } = useToast();

  // Progress timer that simulates estimated progress
  useEffect(() => {
    if (isAnalyzing) {
      setProgress(0);
      setElapsedSeconds(0);
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => {
          const next = prev + 1;
          // Asymptotic curve: approaches 95% but never reaches 100% until done
          const pct = Math.min(95, (next / ESTIMATED_SECONDS) * 80 + (1 - Math.exp(-next / 8)) * 15);
          setProgress(pct);
          return next;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (analysis) {
        setProgress(100);
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isAnalyzing, analysis]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const compressed = await compressImage(reader.result as string);
          setSelectedImage(compressed);
          setAnalysis(null);
        } catch {
          setSelectedImage(reader.result as string);
          setAnalysis(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const getTimeRemaining = () => {
    const remaining = Math.max(0, ESTIMATED_SECONDS - elapsedSeconds);
    if (remaining <= 0 && isAnalyzing) return "Almost done...";
    if (remaining === 1) return "~1 second remaining";
    return `~${remaining} seconds remaining`;
  };

  const analyzeCrop = async () => {
    if (!selectedImage) {
      toast({
        title: "No image selected",
        description: "Please upload a crop image first",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setAnalysis(null);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-crop", {
        body: { image: selectedImage },
      });

      if (error) throw error;

      setAnalysis(data.analysis);
      toast({
        title: "Analysis Complete",
        description: "Your crop has been analyzed successfully",
      });
    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze crop. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <section id="disease-detection" className="py-20 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold">
            AI Crop Disease Detection
          </h2>
          <p className="text-xl text-muted-foreground">
            Upload a photo of your crop and get instant AI-powered disease diagnosis with treatment recommendations
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Upload Card */}
          <Card className="shadow-[var(--shadow-soft)] border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-primary" />
                Upload Crop Image
              </CardTitle>
              <CardDescription>
                Take a clear photo of the affected crop leaves or stems
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative aspect-square rounded-lg overflow-hidden bg-muted border-2 border-dashed border-border hover:border-primary/50 transition-colors">
                {selectedImage ? (
                  <img
                    src={selectedImage}
                    alt="Selected crop"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                    <img
                      src={cropAnalysisImage}
                      alt="Crop analysis placeholder"
                      className="w-32 h-32 object-cover rounded-lg mb-4 opacity-50"
                    />
                    <Upload className="w-12 h-12 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload or drag and drop
                    </p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>

              <Button
                onClick={analyzeCrop}
                disabled={!selectedImage || isAnalyzing}
                className="w-full"
                size="lg"
                variant="hero"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Camera className="w-5 h-5" />
                    Analyze Crop
                  </>
                )}
              </Button>

              {/* Progress indicator */}
              {(isAnalyzing || progress === 100) && (
                <div className="space-y-2 animate-in fade-in duration-300">
                  <Progress value={progress} className="h-2" />
                  <p className="text-xs text-muted-foreground text-center">
                    {isAnalyzing ? getTimeRemaining() : "Analysis complete!"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Results Card */}
          <Card className="shadow-[var(--shadow-soft)] border-2">
            <CardHeader>
              <CardTitle>Analysis Results</CardTitle>
              <CardDescription>
                AI-powered diagnosis and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analysis ? (
                <div className="prose prose-sm max-w-none">
                  <div className="bg-muted/50 p-4 rounded-lg whitespace-pre-wrap text-sm leading-relaxed">
                    {analysis}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Camera className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p>Upload and analyze a crop image to see results here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
