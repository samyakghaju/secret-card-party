import { cn } from "@/lib/utils";
import { Skull, Shield, Heart, Search, Crown, User } from "lucide-react";
import { Role, ROLE_INFO, isMafiaRole } from "@/lib/gameTypes";

interface PaperCardProps {
  playerName: string;
  role: Role;
  revealed: boolean;
}

const getRoleIcon = (role: Role) => {
  switch (role) {
    case "godfather":
      return Crown;
    case "mafioso":
    case "mafia":
      return Skull;
    case "doctor":
      return Heart;
    case "detective":
      return Search;
    case "civilian":
    default:
      return Shield;
  }
};

export const PaperCard = ({ playerName, role, revealed }: PaperCardProps) => {
  const isMafia = isMafiaRole(role);
  const roleInfo = ROLE_INFO[role];
  const Icon = getRoleIcon(role);

  return (
    <div
      className={cn(
        "relative w-full max-w-xs aspect-[3/4] rounded-xl paper-texture overflow-hidden transition-all duration-500 shadow-card",
        revealed && (isMafia ? "shadow-glow-mafia" : "shadow-glow-civilian")
      )}
    >
      {/* Card Back (shown when not revealed) */}
      {!revealed && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-gradient-to-br from-secondary to-secondary/80">
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mb-4">
            <User size={40} className="text-primary" />
          </div>
          <p className="font-display text-xl font-bold text-foreground">{playerName}</p>
          <p className="text-sm text-muted-foreground mt-2">Tap to reveal</p>
          
          {/* Corner Decorations */}
          <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 rounded-tl-lg border-primary/40" />
          <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 rounded-tr-lg border-primary/40" />
          <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 rounded-bl-lg border-primary/40" />
          <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 rounded-br-lg border-primary/40" />
        </div>
      )}

      {/* Card Content (shown when revealed) */}
      {revealed && (
        <div className="absolute inset-0 flex flex-col items-center justify-between p-6 text-ink animate-reveal">
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
              <Icon size={48} className={isMafia ? "text-mafia" : "text-civilian"} />
            </div>

            {/* Role Text */}
            <div className="text-center">
              <p className="text-sm text-ink/60 uppercase tracking-widest mb-1">
                You are
              </p>
              <h2
                className={cn(
                  "font-display text-3xl font-bold tracking-tight",
                  isMafia ? "text-mafia" : "text-civilian"
                )}
              >
                {roleInfo.title.toUpperCase()}
              </h2>
              <p className="text-xs text-ink/50 mt-2 max-w-[180px]">
                {roleInfo.description}
              </p>
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
      )}
    </div>
  );
};
