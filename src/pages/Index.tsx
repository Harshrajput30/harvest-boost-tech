import { useRef } from "react";
import { Hero } from "@/components/Hero";
import { CropAnalysis } from "@/components/CropAnalysis";
import { FarmAssistant } from "@/components/FarmAssistant";
import { FarmingTips } from "@/components/FarmingTips";

const Index = () => {
  const diseaseDetectionRef = useRef<HTMLDivElement>(null);

  const scrollToDiseaseDetection = () => {
    diseaseDetectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen">
      <Hero onScrollToDiseaseDetection={scrollToDiseaseDetection} />
      <div ref={diseaseDetectionRef}>
        <CropAnalysis />
      </div>
      <FarmAssistant />
      <FarmingTips />
      
      {/* Footer */}
      <footer className="bg-card border-t py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p className="text-sm">
            © 2025 Smart Farm AI. Empowering farmers with AI technology.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
