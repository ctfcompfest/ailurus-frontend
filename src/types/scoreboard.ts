export interface ChallengeScore {
  flag_captured: number;
  flag_stolen: number;
  attack: string;
  defense: string;
  sla: string;
}

export interface Score {
  id: number;
  name: string;
  rank: number;
  total_score: number;
  challenges: Record<string, ChallengeScore>;
}
