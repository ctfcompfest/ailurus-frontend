import { getAdmin } from "@/components/fetcher/admin";
import { ChallengeDetail } from "@/types/challenge";
import { useQuery } from "@tanstack/react-query";
import { InputLabel } from "../common/detail";
import { ReactElement, useRef } from "react";

function ChallengeDetailRow({ challId }: { challId: number }) {
  const { isLoading, data } = useQuery({
    queryKey: ["challenges", challId],
    queryFn: () =>
      getAdmin<ChallengeDetail>("admin/challenges/" + challId),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!!!data) {
    return (
      <div className="flex items-center justify-center">
        Failed to load data
      </div>
    );
  }

  const chall = data.data;
  return (
    <div className="flex flex-col">
      <h4 className="font-bold text-xl pb-4">Server Detail</h4>
      <InputLabel label="ID" value={chall.id.toString()} />
      <InputLabel label="Slug" value={chall.slug.toString()} />
      <InputLabel label="Title" value={chall.title.toString()} />
      <InputLabel label="Description" value={chall.description} textarea />
      <InputLabel label="Number Service" value={chall.num_service.toString()} />
      <InputLabel label="Number Flag" value={chall.num_flag.toString()} />
      <InputLabel label="Point(s)" value={chall.point.toString()} />
      <InputLabel label="Artifact Checksum" value={chall.artifact_checksum?.toString()} />
      <InputLabel label="Testcase Checksum" value={chall.testcase_checksum?.toString()} />
      <InputLabel label="Visibility" value={chall.visibility.join(",")} />
    </div>
  );
}

export default function ChallengeDetailModal({
  challId,
  btn,
}: {
  challId: number;
  btn: ReactElement;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  return (
    <>
      <a onClick={() => ref.current?.showModal()}>{btn}</a>
      <dialog className="modal" ref={ref}>
        <div className="modal-box">
          <ChallengeDetailRow challId={challId} />
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </>
  );
}
