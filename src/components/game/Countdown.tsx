import { useEffect, useState } from "react";
import { soundManager } from "@/lib/sounds";

interface CountdownProps {
  seconds: number;
  onComplete: () => void;
  label?: string;
}

export const Countdown = ({ seconds, onComplete, label }: CountdownProps) => {
  const [count, setCount] = useState(seconds);

  useEffect(() => {
    if (count <= 0) {
      onComplete();
      return;
    }

    soundManager.playTick();
    
    const timer = setTimeout(() => {
      setCount(count - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [count, onComplete]);

  return (
    <div className="flex flex-col items-center justify-center gap-4 animate-scale-in">
      {label && (
        <p className="text-xl text-muted-foreground font-medium">{label}</p>
      )}
      <div className="w-32 h-32 rounded-full border-4 border-primary flex items-center justify-center bg-primary/20 animate-pulse-glow">
        <span className="font-display text-6xl font-bold text-primary">
          {count}
        </span>
      </div>
    </div>
  );
};
