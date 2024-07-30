export interface Submission {
    id: number;
    challenge_id: number;
    challenge_name: string;
    team_id: number;
    team_name: string;
    round: number;
    tick: number;
    time_created: string;
    value: string;
    verdict: boolean;
    point: number;
}

export interface SubmissionResponse {
    next_page: number | undefined;
    prev_page: number | undefined;
    current_page: number;
    data: Submission[];
}