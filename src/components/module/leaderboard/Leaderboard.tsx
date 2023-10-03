import { getAdmin } from "@/components/fetcher/admin";
import { getUser, useUserResources } from "@/components/fetcher/user";
import { ChallengeScore, Score } from "@/types/scoreboard";
import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import React from "react";
import ServiceStatus from "../common/Modal/ServiceStatus";

interface LeaderboardProps {
  isAdmin?: boolean;
  className?: string;
}

export default function Leaderboard({ isAdmin, className }: LeaderboardProps) {
  const userResourcesQuery = useUserResources();
  const scoreboardQuery = useQuery({
    queryKey: ["leaderboard", isAdmin ? "admin" : "user"],
    queryFn: () =>
      isAdmin
        ? getAdmin<Score[]>("admin/scoreboard/")
        : getUser<Score[], { is_freeze: boolean }>("scoreboard/"),
  });

  if (userResourcesQuery.isLoading || scoreboardQuery.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (userResourcesQuery.error || scoreboardQuery.error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        An error has occured.
      </div>
    );
  }

  return (
    <div className={className}>
      {"is_freeze" in (scoreboardQuery?.data ?? {}) &&
        // @ts-ignore
        scoreboardQuery.data.is_freeze && (
          <div className="my-4 py-2 px-4 bg-primary text-primary-content rounded-md">
            Leaderboard is frozen.
          </div>
        )}

      <table className="table">
        <thead>
          <tr>
            <th></th>
            <th>Team</th>
            {userResourcesQuery.datas.challenges.data.map((chall) => (
              <th key={chall.id} className="w-40">
                {chall.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {scoreboardQuery.data?.data?.map((team) => (
            <tr key={team.id}>
              <th>{team.rank}</th>
              <td>
                <div className="flex flex-col gap-2">
                  <strong className="font-bold">{team.name}</strong>
                  <span title="Total Score">{team.total_score.toFixed(2)}</span>
                </div>
              </td>

              {userResourcesQuery.datas.challenges.data.map((chall) => {
                const challScore: ChallengeScore | undefined =
                  team.challenges[chall.id.toString()];
                const serviceState =
                  userResourcesQuery.datas.serviceStatus.data[
                    chall.id.toString()
                  ]?.[team.id.toString()];
                return (
                  <td key={chall.id}>
                    <div className="grid grid-cols-2 font-mono">
                      <span className="text-error text-xl" title="Attack Score">
                        {challScore.attack.toFixed(2) ?? 0}
                      </span>
                      <span
                        className="text-success text-xl"
                        title="Defend Score"
                      >
                        {challScore.defense.toFixed(2) ?? 0}
                      </span>
                      <div className="col-span-2">
                        <span className="text-error" title="Flag Captured">
                          FC: {challScore.flag_captured ?? 0}
                        </span>{" "}
                        /{" "}
                        <span className="text-success" title="Flag Stolen">
                          FS: {challScore.flag_stolen ?? 0}
                        </span>
                      </div>
                      <span title="SLA">
                        {(challScore.sla * 100).toFixed(2) ?? "?"}%
                      </span>
                      <span title="State">
                        <ServiceStatus status={serviceState} size={18}/>
                      </span>
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
