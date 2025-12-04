import { cn } from "@/lib/utils";
import { Skull, Shield } from "lucide-react";

interface PaperCardProps {
  playerName: string;
  role: "mafia" | "civilian";
  revealed: boolean;
}

export const PaperCard = ({ playerName, role, revealed }: PaperCardProps) => {
  const isMafia = role === "mafia";

  return (
    <div
      className={cn(
        "relative w-full max-w-xs aspect-[3/4] rounded-xl paper-texture overflow-hidden transition-all duration-500",
        revealed ? "animate-reveal shadow-card" : "opacity-0 scale-75",
        isMafia ? "shadow-glow-mafia" : "shadow-glow-civilian"
      )}
    >
      {/* Card Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-between p-6 text-ink">
        {/* Top Ornament */}
        <div className="w-full flex justify-center">
          <div
            className={cn(
              "w-16 h-1 rounded-full",
              isMafia ? "bg-mafia/60" : "bg-civilian/60"
            )}
          />
        </div>

        {/* Center Content */}
        <div className="flex flex-col items-center gap-4">
          {/* Role Icon */}
          <div
            className={cn(
              "w-24 h-24 rounded-full flex items-center justify-center animate-pulse-glow",
              isMafia
                ? "bg-gradient-to-br from-mafia/20 to-mafia/40"
                : "bg-gradient-to-br from-civilian/20 to-civilian/40"
            )}
          >
            {isMafia ? (
              <Skull size={48} className="text-mafia" />
            ) : (
              <Shield size={48} className="text-civilian" />
            )}
          </div>

          {/* Role Text */}
          <div className="text-center">
            <p className="text-sm text-ink/60 uppercase tracking-widest mb-1">
              You are
            </p>
            <h2
              className={cn(
                "font-display text-4xl font-bold tracking-tight",
                isMafia ? "text-mafia" : "text-civilian"
              )}
            >
              {isMafia ? "MAFIA" : "CIVILIAN"}
            </h2>
          </div>
        </div>

        {/* Player Name */}
        <div className="text-center">
          <p className="text-xs text-ink/50 uppercase tracking-wider mb-1">
            Player
          </p>
          <p className="font-display text-xl font-bold text-ink truncate max-w-[200px]">
            {playerName}
          </p>
        </div>
      </div>

      {/* Corner Decorations */}
      <div
        className={cn(
          "absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 rounded-tl-lg",
          isMafia ? "border-mafia/40" : "border-civilian/40"
        )}
      />
      <div
        className={cn(
          "absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 rounded-tr-lg",
          isMafia ? "border-mafia/40" : "border-civilian/40"
        )}
      />
      <div
        className={cn(
          "absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 rounded-bl-lg",
          isMafia ? "border-mafia/40" : "border-civilian/40"
        )}
      />
      <div
        className={cn(
          "absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 rounded-br-lg",
          isMafia ? "border-mafia/40" : "border-civilian/40"
        )}
      />
    </div>
  );
};
