type ChallengeKey = string;
type Address = string;
type TeamKey = string;
export type ServiceList = Record<ChallengeKey, Record<TeamKey, Address[]>>;

// Same thing as enum, but I don't want runtime code
type Faulty = 0;
type Valid = 1;
export type ServerState = Faulty | Valid;

export interface ServiceMeta {
  log: string;
  meta: string;
}

export interface ServiceMetadata {
  applied_patch: string;
  last_patch: string;
  last_reset: string;
  last_restart: string;
}

export interface Service {
  id: number;
  team_id: number;
  challenge_id: number;
  order: number;
  detail: Map<string, any>;
  secret: string;
}