import { useMutation, useQueries } from "@tanstack/react-query";
import { TeamChallServiceProps } from "../interface";
import { ServerState, ServiceMeta } from "@/types/service";
import { getUser, postUser } from "@/components/fetcher/user";
import { useRef } from "react";
import { ArrowDown, ArrowUp, Lock } from "@phosphor-icons/react";
import ConfirmModal from "@/components/module/common/Modal/ConfirmModal";

export default function PatchBasedPanel({ chall, isUnlocked }: TeamChallServiceProps) {
    const [statusQuery, metaQuery] = useQueries({
      queries: [
        {
          queryKey: ["team", "chall", chall?.id, "status"],
          queryFn: () => getUser<ServerState>(`my/challenges/${chall?.id}/services-status/`),
          enabled: isUnlocked,
        },
        {
          queryKey: ["team", "chall", chall?.id, "meta"],
          queryFn: () => getUser<ServiceMeta>(`my/challenges/${chall?.id}/service-manager/?action=get_meta`),
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
        return postUser(`my/challenges/${chall?.id}/service-manager/?action=patch`, { body: formdata });
      },
      onSettled: () => {
        if (ref.current) ref.current.value = "";
      },
    });
    const resetService = useMutation({
      mutationFn: () =>
        postUser(`my/challenges/${chall?.id}/service-manager/?action=reset`, {
          json: { confirm: true },
        }),
    });
    const restartService = useMutation({
      mutationFn: () =>
        postUser(`my/challenges/${chall?.id}/service-manager/?action=restart`, {
          json: { confirm: true },
        }),
    });
  
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
      <div className="p-4 rounded-md bg-neutral">
        <div className="px-4 pt-4">
          <div></div>
          <h3 className="font-bold text-xl gap-2">
            [
            <span>
              {statusQuery.isFetching
                ? "Loading..."
                : statusQuery.error
                ? "An error occured"
                : (statusQuery.data?.data?.status == 0 || statusQuery.data?.data?.status == undefined)
                ? faultyDisplay
                : validDisplay}
            </span>{" "}
            ]{"  "}
            {chall?.title ?? "ChallengeNotFound"}{" "}
            {!isUnlocked && <Lock size={18} className="inline" />}
          </h3>
        </div>
  
        <div className="flex flex-col gap-2 p-4">
          <div className="divider m-0" />
  
          <strong>Metadata:</strong>
          <pre className="p-4 rounded-md bg-base-300">
            {metaQuery.data?.data.meta ?? ""}
          </pre>
  
          <details className="py-4">
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