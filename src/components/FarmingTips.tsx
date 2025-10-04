import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sprout, Droplets, Sun, Bug, TrendingUp, AlertTriangle } from "lucide-react";

const tips = [
  {
    icon: Sprout,
    title: "Crop Rotation",
    description: "Rotate crops seasonally to maintain soil health and reduce pest buildup",
    color: "text-primary",
  },
  {
    icon: Droplets,
    title: "Water Management",
    description: "Use drip irrigation for water efficiency and consistent crop moisture",
    color: "text-blue-500",
  },
  {
    icon: Sun,
    title: "Optimal Timing",
    description: "Plant during ideal weather windows for your region and crop type",
    color: "text-amber-500",
  },
  {
    icon: Bug,
    title: "Pest Control",
    description: "Monitor regularly and use integrated pest management strategies",
    color: "text-red-500",
  },
  {
    icon: TrendingUp,
    title: "Soil Testing",
    description: "Test soil annually to optimize fertilizer use and crop nutrition",
    color: "text-green-500",
  },
  {
    icon: AlertTriangle,
    title: "Early Detection",
    description: "Inspect crops weekly to catch diseases early when they're easiest to treat",
    color: "text-orange-500",
  },
];

export const FarmingTips = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold">
            Essential Farming Tips
          </h2>
          <p className="text-xl text-muted-foreground">
            Best practices to maximize your harvest and maintain healthy crops
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {tips.map((tip, index) => {
            const Icon = tip.icon;
            return (
              <Card
                key={index}
                className="shadow-[var(--shadow-soft)] border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-[var(--shadow-glow)] hover:-translate-y-1"
              >
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br from-background to-muted flex items-center justify-center mb-2 ${tip.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-xl">{tip.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {tip.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
