import { postAdmin, useAdminChallenges, useAdminTeams } from "@/components/fetcher/admin";
import { Challenge } from "@/types/challenge";
import { Team } from "@/types/team";
import { useMutation, useQuery } from "@tanstack/react-query";
import React from "react";
import ConfirmModal from "../../common/Modal/ConfirmModal";
import ServiceDetailModal from "./ServiceDetailModal";

function ServiceRow({chall, team} : {chall: Challenge, team: Team}) {
  const resetMutation = useMutation({
    mutationFn: () =>
      postAdmin(`admin/teams/${team.id}/challenges/${chall.id}/service-manager/?action=reset`, {
        json: { confirm: true },
      }),
  });
  const deleteMutation = useMutation({
    mutationFn: () =>
      postAdmin(`admin/teams/${team.id}/challenges/${chall.id}/service-manager/?action=delete`, {
        json: { confirm: true },
      }),
  });
  const provisionMutation = useMutation({
    mutationFn: () =>
      postAdmin(`admin/teams/${team.id}/challenges/${chall.id}/service-manager/?action=provision`, {
        json: { confirm: true },
      }),
  });

  return (
    <div
      className="p-4 rounded-md bg-neutral text-neutral-content flex flex-row justify-between items-center my-2"
    >
      <div className="flex flex-col gap-1">
        {team.name}
      </div>

      <div className="flex flex-row gap-2 items-center">
        <ServiceDetailModal
          challId={chall.id}
          teamId={team.id}
          btn={
            <button className="btn btn-black-500 btn-sm">
              See detail
            </button>
          }
        />
        <ConfirmModal
          action="Provision"
          btn={<button className="btn btn-accent btn-sm">Provision</button>}
          onAction={() => provisionMutation.mutate()}
        >
          Service for team <strong>{team.name}</strong> in challenge <strong>{chall.title}</strong>&nbsp;
          will be <u>provisioned</u>. Are you sure?
        </ConfirmModal>
        <ConfirmModal
          action="Reset"
          btn={<button className="btn btn-warning btn-sm">Reset</button>}
          onAction={() => resetMutation.mutate()}
        >
          Service for team <strong>{team.name}</strong> in challenge <strong>{chall.title}</strong>&nbsp;
          will be <u>reset</u>. Are you sure?
        </ConfirmModal>
        <ConfirmModal
          action="Delete"
          btn={<button className="btn btn-error btn-sm">Delete</button>}
          onAction={() => deleteMutation.mutate()}
        >
          Service for team <strong>{team.name}</strong> in challenge <strong>{chall.title}</strong>&nbsp;
          will be <u>deleted</u>. Are you sure?
        </ConfirmModal>
      </div>
    </div>
  );
}

function ChallengeServicesSection({chall, teams}: {chall: Challenge, teams: Team[] | undefined}) {
  return(
    <div className="my-5">
      <div className="rounded-md p-2 my-2 flex flex-row justify-between items-center gap-4">
        <strong className="font-strong text-lg">{chall.title}</strong>
      </div>
      {teams?.map(team => (
        <ServiceRow chall={chall} team={team} key={`servicerow-${team.id}-${chall.id}`}/>
      ))}
    </div>
  )
}

export default function ServicePage() {
  const { isLoading: challengesLoad, data: challenges } = useAdminChallenges();
  const { isLoading: teamsLoad, data: teams } = useAdminTeams();
  
  const provisionServices = useMutation({
    mutationFn: () =>
      postAdmin(`admin/services-manager/?action=provision`, {
        json: { challenges: "*", teams: "*" },
      }),
  });

  if (challengesLoad || teamsLoad) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="px-4">
      <div className="flex flex-row justify-between">
        <h2 className="py-2 text-2xl font-bold">Service</h2>
      </div>

      <div className="bg bg-neutral rounded-md p-4 my-2 flex flex-row justify-between items-center gap-4">
        <div className="flex flex-col gap-2">
          <strong className="font-strong text-lg">Provision Services</strong>
          <p className="text-sm">
            Provision each team&apos;s challenge services.
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => provisionServices.mutate()}
        >
          Provision All
        </button>
      </div>

      {challenges?.data.map((chall) => (
        <ChallengeServicesSection chall={chall} teams={teams?.data} key={`challsection-${chall.id}`} />
      ))}
    </div>
  );
}
