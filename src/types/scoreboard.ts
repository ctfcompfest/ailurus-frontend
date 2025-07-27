export interface ChallengeScore {
  flag_captured: number;
  flag_stolen: number;
  attack: number;
  defense: number;
  sla: number;
  attack_group_score: number;
  defense_group_score: number;
  sla_group_score: number;
}

export interface Score {
  id: number;
  name: string;
  rank: number;
  total_score: number;
  challenges: Record<string, ChallengeScore>;
}
