export interface AttackLogEntity {
  id: number;
  name: string;
}

export interface AttackLog {
  attacker: AttackLogEntity;
  defender: AttackLogEntity;
  solved_at?: Date;
}

export interface AttackMarker {
  attackerId: number;
  defenderId: number;
  color: string;
}
