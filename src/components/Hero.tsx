import { Button } from "@/components/ui/button";
import { ArrowRight, Leaf } from "lucide-react";
import heroImage from "@/assets/hero-farm.jpg";

export const Hero = ({ onScrollToDiseaseDetection }: { onScrollToDiseaseDetection: () => void }) => {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Modern farmer using technology in agricultural field"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/30" />
      </div>

      {/* Content */}
      <div className="container relative z-10 mx-auto px-4 py-20">
        <div className="max-w-2xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
            <Leaf className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-primary">AI-Powered Farming</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            Smart Farming
            <br />
            <span className="bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
              Made Simple
            </span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-xl">
            Detect crop diseases instantly, get expert farming advice, and optimize your harvest with
            AI-powered insights designed for modern farmers.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              size="lg"
              variant="hero"
              className="text-base px-8"
              onClick={onScrollToDiseaseDetection}
            >
              Analyze Your Crops
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-base px-8 bg-card/50 backdrop-blur-sm"
            >
              Learn More
            </Button>
          </div>

          <div className="flex items-center gap-8 pt-8 border-t border-border/50">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">10K+</div>
              <div className="text-sm text-muted-foreground">Farmers Helped</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">50+</div>
              <div className="text-sm text-muted-foreground">Crops Supported</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">95%</div>
              <div className="text-sm text-muted-foreground">Accuracy Rate</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
