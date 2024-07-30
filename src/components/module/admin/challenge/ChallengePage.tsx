import React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChallengeDetail as typeChallenge } from "@/types/challenge";
import { deleteAdmin, getAdmin } from "@/components/fetcher/admin";
import ChallengeFormModal from "./ChallengeFormModal";
import { Plus } from "@phosphor-icons/react";

function ChallengeRow({ challenge }: { challenge: typeChallenge }) {
  const queryClient = useQueryClient();
  const deleteTeam = useMutation({
    mutationFn: () => deleteAdmin("admin/challenges/" + challenge.id),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["challenges"]});
      queryClient.invalidateQueries({queryKey: ["admin", "challenges"]});
    },
  });

  const updatedChall = React.useMemo(() => ({ ...challenge }), [challenge]);

  return (
    <div className="flex flex-row justify-between p-4 bg-neutral text-neutral-content rounded-md">
      {updatedChall.title}

      <div className="flex flex-row gap-2">
        <ChallengeFormModal
          mode="update"
          chall={{
            ...updatedChall,
            visibility: updatedChall.visibility.join(","),
          }}
          challId={updatedChall.id}
          btn={<button className="btn btn-secondary btn-sm">Edit</button>}
        />

        <button
          className="btn btn-error btn-sm"
          onClick={() => deleteTeam.mutate()}
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default function ChallengePage() {
  const { isLoading, data } = useQuery({
    queryKey: ["challenges"],
    queryFn: () => getAdmin<typeChallenge[]>("admin/challenges/"),
  });

  return (
    <div className="px-4 flex flex-col gap-4">
      <div className="flex flex-row justify-between">
        <h2 className="pt-2 pb-4 text-2xl font-bold">Challenges</h2>
        <ChallengeFormModal
          btn={
            <button className="btn btn-primary">
              <Plus size={18} /> Add Challenge
            </button>
          }
          mode="new"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : !!!data ? (
        <div className="flex items-center justify-center">
          No challenges to show
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {data?.data.map((chall) => (
            <ChallengeRow challenge={chall} key={chall.id} />
          ))}
        </div>
      )}
    </div>
  );
}
