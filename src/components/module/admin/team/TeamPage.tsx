import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useMemo } from "react";
import { Team } from "@/types/team";
import { Plus } from "@phosphor-icons/react";
import { getAdmin, deleteAdmin } from "@/components/fetcher/admin";
import { TeamProps } from "./interface";
import TeamFormModal from "./TeamFormModal";

function TeamRow({
  team,
}: TeamProps) {
  const queryClient = useQueryClient();
  const deleteTeam = useMutation({
    mutationFn: () => deleteAdmin("admin/teams/" + team.id),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["teams"]});
      queryClient.invalidateQueries({queryKey: ["admin", "teams"]});
    },
  });

  const updatedTeam = useMemo(() => ({ ...team }), [team]);

  return (
    <div
      className="p-4 rounded-md bg-neutral text-neutral-content flex flex-row justify-between"
      key={team.id}
    >
      {team.name}
      <div className="flex flex-row gap-2 items-center">
        <TeamFormModal
          btn={<button className="btn btn-secondary btn-sm">Edit</button>}
          mode="update"
          team={updatedTeam}
          teamId={team.id}
        />
        <button
          className="btn btn-error btn-sm"
          onClick={() => {
            deleteTeam.mutate();
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default function TeamPage() {
  const { isLoading, data } = useQuery({
    queryKey: ["teams"],
    queryFn: () => getAdmin<Team[]>("admin/teams/"),
  });

  return (
    <div className="px-4">
      <div className="flex flex-row justify-between">
        <h2 className="pt-2 pb-4 text-2xl font-bold">Team</h2>
        <TeamFormModal
          btn={
            <button className="btn btn-primary">
              <Plus size={18} />
              Add Team
            </button>
          }
          mode="new"
          team={undefined}
          teamId={undefined}
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : !!!data ? (
        <div className="flex items-center justify-center">No team to show</div>
      ) : (
        <div className="flex flex-col gap-4">
          {data.data.map((team) => (
            <TeamRow team={team} key={team.id} />
          ))}
        </div>
      )}
    </div>
  );
}
