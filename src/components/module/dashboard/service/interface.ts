import { Challenge } from "@/types/challenge";

export interface TeamChallServiceProps {
    chall: Challenge | undefined;
    isUnlocked: boolean;
}