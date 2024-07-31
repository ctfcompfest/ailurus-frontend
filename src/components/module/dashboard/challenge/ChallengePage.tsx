import { useRouter } from "next/router";
import {
  getUser,
  postUser,
  useUserResources,
  useUserServicesStatus,
} from "@/components/fetcher/user";
import { authTokenAtom } from "@/components/states";
import { parseJwt } from "@/components/utils";
import { Challenge } from "@/types/challenge";
import { Team } from "@/types/team";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAtom } from "jotai";
import React, { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Lock } from "@phosphor-icons/react";
import Link from "next/link";

interface ServiceRowProps {
  chall: Challenge | undefined;
  services: Record<string, string[] | Map<string, any> | string> | undefined;
  teams: Team[] | undefined;
}

interface TeamServiceRowProps {
  teamId: number;
  challId: number;
  teamName: string;
  serviceDatas: string[] | string | Map<string, any>;
  challUnlocked: boolean | undefined;
  isPrivate: boolean | undefined;
}

function TeamServiceRow({
  teamName,
  serviceDatas,
  teamId,
  challId,
  challUnlocked,
  isPrivate,
}: TeamServiceRowProps) {
  const { isFetching: statusFetching, data: status } = useUserServicesStatus();
  const state = status?.data[challId.toString()]?.[teamId.toString()];

  const faultyDisplay = (
    <span className="text-error items-center gap-2">
      <ArrowDown size={20} className="inline" />
      {" Faulty"}
    </span>
  );
  const validDisplay = (
    <span className="text-success items-center gap-2">
      <ArrowUp size={20} className="inline" />
      {" Valid"}
    </span>
  );

  return (
    <div className="flex gap-2 w-full">
      <div
        key={teamId}
        className="flex flex-row justify-between p-4 rounded-md bg-base-100 text-base-content items-center w-full"
      >
        <div className="flex flex-col gap-2 justify-center">
          <strong>{teamName}</strong>
          <span>
            {statusFetching
              ? "Fetching..."
              : state === 0
              ? faultyDisplay
              : validDisplay}
          </span>
        </div>
        <ul className="list-inside">
          {serviceDatas == null || serviceDatas == undefined ? <></>:
            typeof serviceDatas === "string" ? serviceDatas:
            typeof Array.isArray(serviceDatas) ? Array.from(serviceDatas as string[]).map((data, index) => (
                typeof data === "string" ? <li key={index}>{data}</li>:<li key={index}>{JSON.stringify(data)}</li>
              )):
              JSON.stringify(serviceDatas)
          }
        </ul>
      </div>
      <div>
        {isPrivate ? (
          <>
            {challUnlocked ? (
              <>
                <Link
                  className="btn btn-secondary h-full leading-relaxed"
                  href={`/dashboard/service/${challId}`}
                >
                  Manage Service
                </Link>
              </>
            ) : (
              <>
                <div
                  className="tooltip tooltip-bottom h-full"
                  data-tip="Solve the challenge to unlock"
                >
                  <button className="btn btn-outline h-full btn-disabled">
                    <span className="leading-relaxed">
                      Manage Service
                      <Lock size={20} className="mx-auto" />
                    </span>
                  </button>
                </div>
              </>
            )}
          </>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}

function ServiceRow({ chall, services, teams }: ServiceRowProps) {
  const [authToken, _] = useAtom(authTokenAtom);

  const [flag, setFlag] = useState("");
  const submitFlag = useMutation({
    mutationFn: (flag: string) =>
      postUser<never>("submit", {
        json: {
          flag,
          challenge_id: chall?.id,
        },
      }),
  });
  const { data: unlockedData } = useQuery({
    queryKey: ["unlocked"],
    queryFn: () => getUser<number[]>("my/allow-manage-services"),
  });

  const parsedJwt = useMemo(
    () => parseJwt<{ sub: { team: Team } }>(authToken),
    [authToken]
  );

  const challUnlocked = useMemo(
    () => (unlockedData?.data ?? []).includes(chall?.id ?? -1),
    [chall, unlockedData]
  );

  const teamsData = teams;
  if (!!!teamsData) {
    return (
      <div className="flex items-center justify-center">
        An error occured while trying to load team data.
      </div>
    );
  }

  return (
    <div className="p-4 rounded-md bg-neutral m-4 p-4">
      <div className="flex flex-col gap-2 p-4">
        <div className="flex flex-row justify-between pt-4">
          <h1 className="text-2xl font-bold pb-5">
            {chall?.title ?? "ChallengeNotFound"}
          </h1>
        </div>
        <p
          className="whitespace-pre-line pb-4 challenge-desc"
          dangerouslySetInnerHTML={{ __html: chall?.description ?? "" }}
        ></p>

        <div className="flex flex-row gap-2">
          <input
            className="w-full input input-bordered"
            placeholder="Flag"
            value={flag}
            onChange={(e) => setFlag(e.currentTarget.value)}
          />
          <button
            className="btn btn-primary"
            onClick={() => {
              submitFlag.mutate(flag);
              setFlag("");
            }}
          >
            Submit
          </button>
        </div>
        <strong className="font-bold text-lg pt-4">Services:</strong>
        {Object.entries(services ?? {})
          .filter((data) => data[0] == parsedJwt?.sub.team.id.toString())
          .map(([teamId, serviceDatas]) => {
            const team = teamsData.find((team) => team.id === Number(teamId));
            return (
              <TeamServiceRow
                serviceDatas={serviceDatas}
                challId={chall?.id ?? 0}
                teamId={team?.id ?? 0}
                teamName={team?.name ?? "TeamNotFound"}
                challUnlocked={challUnlocked}
                isPrivate={true}
                key={`${chall?.id}-${team?.id}`}
              />
            );
          })}

        {challUnlocked && (
          <>
            <strong className="font-bold text-lg pt-4">
              Other Team Services:
            </strong>
            {Object.entries(services ?? {})
              .filter((data) => data[0] != parsedJwt?.sub.team.id.toString())
              .map(([teamId, serviceDatas]) => {
                const team = teamsData.find(
                  (team) => team.id === Number(teamId)
                );
                return (
                  <TeamServiceRow
                    serviceDatas={serviceDatas}
                    challId={chall?.id ?? 0}
                    teamId={team?.id ?? 0}
                    teamName={team?.name ?? "TeamNotFound"}
                    challUnlocked={challUnlocked}
                    isPrivate={false}
                    key={`${chall?.id}-${team?.id}`}
                  />
                );
              })}
          </>
        )}
      </div>
    </div>
  );
}

export default function ChallengePage() {
  const router = useRouter();
  const challId = router.query.id;

  const { isLoading, error, datas } = useUserResources();
  const challData = useQuery({
    queryKey: ["challenges", challId],
    queryFn: () => getUser<Challenge>("challenges/" + challId),
  });

  if (isLoading || challData.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error || challData.error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        An error has occured.
      </div>
    );
  }

  const chall = challData.data?.data;
  const services = datas.services.data[chall?.id.toString() ?? "-1"];

  return (
    <ServiceRow
      chall={chall}
      services={services}
      teams={datas.teams.data}
      key={"chall-" + chall?.id}
    />
  );
}
