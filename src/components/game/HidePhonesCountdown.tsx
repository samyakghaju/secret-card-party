import { Countdown } from "./Countdown";
import { EyeOff } from "lucide-react";

interface HidePhonesCountdownProps {
  onComplete: () => void;
}

export const HidePhonesCountdown = ({ onComplete }: HidePhonesCountdownProps) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 bg-background">
      <div className="text-center space-y-6 animate-slide-up">
        <div className="w-24 h-24 mx-auto rounded-full bg-primary/20 flex items-center justify-center animate-pulse-glow">
          <EyeOff size={48} className="text-primary" />
        </div>
        <h2 className="font-display text-2xl font-bold text-foreground">
          Hide Your Phones!
        </h2>
        <p className="text-muted-foreground">
          Don't let others see your role
        </p>
      </div>
      <div className="mt-8">
        <Countdown 
          seconds={3} 
          onComplete={onComplete}
        />
      </div>
    </div>
  );
};
