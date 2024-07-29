import { getUser, postUser, useUserResources } from "@/components/fetcher/user";
import { Challenge } from "@/types/challenge";
import { ServerMode } from "@/types/common";
import { ServerState, ServiceMeta } from "@/types/service";
import { Lock } from "@phosphor-icons/react";
import { useMutation, useQueries, useQuery } from "@tanstack/react-query";
import React, { useMemo, useRef, useState } from "react";
import ConfirmModal from "../../common/Modal/ConfirmModal";

interface TeamChallServiceProps {
  chall: Challenge;
  isUnlocked: boolean;
}

function TeamChallService({ chall, isUnlocked }: TeamChallServiceProps) {
  const [statusQuery, metaQuery] = useQueries({
    queries: [
      {
        queryKey: ["team", "chall", chall.id, "status"],
        queryFn: () => getUser<ServerState>(`chalenges/${chall.id}/services-status`),
        enabled: isUnlocked,
      },
      {
        queryKey: ["team", "chall", chall.id, "meta"],
        queryFn: () => getUser<ServiceMeta>(`my/services/${chall.id}/meta`),
        enabled: isUnlocked,
      },
    ],
  });
  const ref = useRef<HTMLInputElement>(null);

  const patchService = useMutation({
    mutationFn: () => {
      const tarfile = ref.current?.files?.[0];
      if (!tarfile) throw new Error("File not inputted");

      const formdata = new FormData();
      formdata.set("patchfile", tarfile);
      return postUser(`my/services/${chall.id}/patch`, { body: formdata });
    },
    onSettled: () => {
      if (ref.current) ref.current.value = "";
    },
  });
  const resetService = useMutation({
    mutationFn: () =>
      postUser(`my/services/${chall.id}/reset`, {
        json: { confirm: true },
      }),
  });
  const restartService = useMutation({
    mutationFn: () =>
      postUser(`my/services/${chall.id}/restart`, {
        json: { confirm: true },
      }),
  });

  return (
    <div className="p-4 rounded-md bg-neutral">
      <h3 className="font-bold text-lg">
        {chall.name} {!isUnlocked && <Lock size={18} className="inline" />}
      </h3>

      <div className="flex flex-col gap-2 pt-2">
        <strong>
          Status:{" "}
          {statusQuery.isFetching
            ? "Loading..."
            : statusQuery.error
            ? "An error occured"
            : statusQuery.data?.data == 0
            ? "Faulty"
            : "Valid"}
        </strong>

        <div className="divider m-0" />

        <strong>Metadata:</strong>
        <pre className="p-4 rounded-md bg-base-300">
          {metaQuery.data?.data.meta ?? ""}
        </pre>

        <details>
          <summary className="font-bold">Log</summary>
          <pre className="mt-2 ml-4 p-4 rounded-md bg-base-300">
            {metaQuery.data?.data.log ?? ""}
          </pre>
        </details>

        <div className="divider m-0" />

        {isUnlocked ? (
          <div className="flex flex-row gap-2">
            <input
              ref={ref}
              className="file-input file-input-bordered w-full"
              type="file"
              disabled={!isUnlocked}
            />
            <button
              className="btn btn-primary"
              onClick={() => patchService.mutate()}
              disabled={!isUnlocked}
            >
              Patch
            </button>

            <ConfirmModal
              action="restart"
              btn={<button className="btn btn-secondary">Restart</button>}
              onAction={() => restartService.mutate()}
            >
              Are you sure you want to restart?
            </ConfirmModal>
            <ConfirmModal
              action="reset"
              btn={<button className="btn btn-error">Reset</button>}
              onAction={() => resetService.mutate()}
            >
              Are you sure you want to reset?
            </ConfirmModal>
          </div>
        ) : (
          <div className="p-4 bg-base-300 rounded-md">
            Cannot patch. You have not solved this challenge!
          </div>
        )}
      </div>
    </div>
  );
}

export default function ServicePage() {
  const { isLoading, error, datas } = useUserResources();
  const {
    isLoading: unlockedLoad,
    error: unlockedError,
    data: unlockedData,
  } = useQuery({
    queryKey: ["unlocked"],
    queryFn: () => getUser<number[]>("my/allow-manage-services"),
  });

  if (isLoading || unlockedLoad) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error || unlockedError) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        An error has occured.
      </div>
    );
  }

  if (datas.challenges.data.length == 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        No challenges available
      </div>
    );
  }

  const unlockedIds = unlockedData?.data ?? [];
  return (
    <div className="flex flex-col gap-4 px-4">
      {datas.challenges.data.map((chall) => (
        <TeamChallService
          chall={chall}
          isUnlocked={unlockedIds.includes(chall.id)}
          key={"chall-" + chall.id}
        />
      ))}
    </div>
  );
}
