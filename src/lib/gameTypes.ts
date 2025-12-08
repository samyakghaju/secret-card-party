export type GameMode = "simple" | "advanced";
export type GamePhase = "mode-select" | "setup" | "lobby" | "reveal" | "night-intro" | "night" | "day" | "voting" | "complete" | "history";

export type SimpleRole = "mafia" | "civilian";
export type AdvancedRole = "godfather" | "mafioso" | "doctor" | "detective" | "civilian";
export type Role = SimpleRole | AdvancedRole;

export const PLAYER_AVATARS = [
  "👤", "🎭", "🦊", "🐺", "🦁", "🐻", "🐼", "🐨", 
  "🐵", "🦅", "🦉", "🐝", "🦋", "🐢", "🐙", "🦈"
] as const;

export interface Player {
  name: string;
  role: Role;
  isAlive: boolean;
  avatar: string;
  isProtected?: boolean;
  isInvestigated?: boolean;
}

export const ROLE_INFO: Record<Role, { title: string; description: string; team: "mafia" | "town" }> = {
  mafia: {
    title: "Mafia",
    description: "Eliminate civilians to win",
    team: "mafia",
  },
  civilian: {
    title: "Civilian",
    description: "Find and vote out the mafia",
    team: "town",
  },
  godfather: {
    title: "Godfather",
    description: "Lead the mafia. Appears innocent to Detective.",
    team: "mafia",
  },
  mafioso: {
    title: "Mafioso",
    description: "Follow the Godfather's orders",
    team: "mafia",
  },
  doctor: {
    title: "Doctor",
    description: "Save one player each night from elimination",
    team: "town",
  },
  detective: {
    title: "Detective",
    description: "Investigate one player each night to learn their alignment",
    team: "town",
  },
};

export const isMafiaRole = (role: Role): boolean => {
  return role === "mafia" || role === "godfather" || role === "mafioso";
};
