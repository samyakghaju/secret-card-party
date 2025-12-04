import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Plus, Minus } from "lucide-react";
import { soundManager } from "@/lib/sounds";
import { cn } from "@/lib/utils";

interface TimerProps {
  defaultMinutes?: number;
  onComplete?: () => void;
}

export const Timer = ({ defaultMinutes = 3, onComplete }: TimerProps) => {
  const [totalSeconds, setTotalSeconds] = useState(defaultMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [initialSeconds, setInitialSeconds] = useState(defaultMinutes * 60);

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const progress = (totalSeconds / initialSeconds) * 100;
  const isLow = totalSeconds <= 10 && totalSeconds > 0;

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && totalSeconds > 0) {
      interval = setInterval(() => {
        setTotalSeconds((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            soundManager.playAlarm();
            onComplete?.();
            return 0;
          }
          if (prev <= 11) {
            soundManager.playTick();
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, onComplete]);

  const handleToggle = () => {
    soundManager.playClick();
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    soundManager.playClick();
    setIsRunning(false);
    setTotalSeconds(initialSeconds);
  };

  const adjustTime = (delta: number) => {
    soundManager.playClick();
    const newTime = Math.max(60, Math.min(600, initialSeconds + delta));
    setInitialSeconds(newTime);
    if (!isRunning) {
      setTotalSeconds(newTime);
    }
  };

  return (
    <div className="bg-secondary/50 rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">Discussion Timer</h3>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => adjustTime(-60)}
            disabled={isRunning || initialSeconds <= 60}
          >
            <Minus size={14} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => adjustTime(60)}
            disabled={isRunning || initialSeconds >= 600}
          >
            <Plus size={14} />
          </Button>
        </div>
      </div>

      {/* Timer Display */}
      <div className="relative">
        <div
          className={cn(
            "text-center font-display text-6xl font-bold transition-colors duration-300",
            isLow ? "text-primary animate-pulse" : "text-foreground"
          )}
        >
          {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </div>

        {/* Progress Bar */}
        <div className="mt-4 h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full transition-all duration-1000 ease-linear rounded-full",
              isLow ? "bg-primary" : "bg-civilian"
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-2 justify-center">
        <Button
          variant={isRunning ? "outline" : "civilian"}
          size="lg"
          onClick={handleToggle}
          className="flex-1 max-w-[140px]"
        >
          {isRunning ? (
            <>
              <Pause size={18} />
              Pause
            </>
          ) : (
            <>
              <Play size={18} />
              Start
            </>
          )}
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={handleReset}
          disabled={totalSeconds === initialSeconds && !isRunning}
        >
          <RotateCcw size={18} />
        </Button>
      </div>
    </div>
  );
};
