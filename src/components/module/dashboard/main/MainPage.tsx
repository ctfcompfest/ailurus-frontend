import {
  getUser,
  postUser,
  useUserChallenges,
  useUserResources,
} from "@/components/fetcher/user";
import { Challenge } from "@/types/challenge";
import { useMutation, useQuery } from "@tanstack/react-query";
import React, { useMemo, useState } from "react";
import { Lock } from "@phosphor-icons/react";
import Link from "next/link";

interface ServiceRowProps {
  chall: Challenge | undefined;
}

function ServiceRow({ chall }: ServiceRowProps) {
  const { data: unlockedData } = useQuery({
    queryKey: ["unlocked"],
    queryFn: () => getUser<number[]>("my/allow-manage-services"),
  });
  const challUnlocked = (unlockedData?.data ?? []).includes(chall?.id ?? -1);

  return (
    <div className="card w-72 bg-neutral">
      <div className="card-body">
        <h2 className="card-title justify-center">
          {chall?.title ?? "ChallengeNotFound"}
        </h2>
        <div className="card-actions justify-center align-middle pt-5">
          <Link
            className="btn btn-primary w-full mb-2"
            href={`/dashboard/challenge/${chall?.id}`}
          >
            View Challenge
          </Link>
          {challUnlocked ? (
            <>
              <Link
                className="btn btn-secondary w-full"
                href={`/dashboard/service/${chall?.id}`}
              >
                Manage Service
              </Link>
            </>
          ) : (
            <>
              <div
                className="tooltip tooltip-bottom w-full"
                data-tip="Solve the challenge to unlock"
              >
                <button className="btn btn-outline btn-disabled w-full">
                  Manage Service
                  <Lock size={18} className="inline" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MainPage() {
  const { isLoading, error, data } = useUserChallenges();
  useQuery({
    queryKey: ["unlocked"],
    queryFn: () => getUser<number[]>("my/allow-manage-services"),
  });
  const [flag, setFlag] = useState("");
  const submitFlag = useMutation({
    mutationFn: (flag: string) =>
      postUser<never>("submit", {
        json: {
          flag: flag,
        },
      }),
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        An error has occured.
      </div>
    );
  }

  if (data?.data.length == 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        No challenges available
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-row gap-4 pt-4 mx-4 mb-5">
        <input
          className="w-full input input-bordered input-primary"
          placeholder="Enter flag here"
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
      <div className="divider mx-4"></div>
      <div className="flex flex-wrap gap-4 px-3 justify-center">
        {data?.data.map((chall) => (
          <ServiceRow chall={chall} key={"chall-" + chall.id} />
        ))}
      </div>
    </div>
  );
}
