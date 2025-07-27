export interface ChallengeScore {
  flag_captured: number;
  flag_stolen: number;
  attack: number;
  defense: number;
  sla: number;
}

export interface Score {
  id: number;
  name: string;
  rank: number;
  total_score: number;
  challenges: Record<string, ChallengeScore>;
}
