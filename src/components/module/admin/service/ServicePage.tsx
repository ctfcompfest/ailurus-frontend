import { getAdmin, postAdmin } from "@/components/fetcher/admin";
import { Challenge } from "@/types/challenge";
import { ServiceList } from "@/types/service";
import { Team } from "@/types/team";
import { useMutation, useQuery } from "@tanstack/react-query";
import React from "react";
import ConfirmModal from "../../common/Modal/ConfirmModal";

interface ServiceRowProps {
  chall: Challenge | undefined;
  services: Record<string, string[]>;
}

interface TeamServiceRowProps {
  teamId: number;
  challId: number;
  teamName: string;
  addresses: string[];
}

function TeamServiceRow({
  teamName,
  addresses,
  teamId,
  challId,
}: TeamServiceRowProps) {
  const resetMutation = useMutation({
    mutationFn: () =>
      postAdmin(`admin/services/${challId}/teams/${teamId}/reset`, {
        json: { confirm: true },
      }),
  });
  const restartMutation = useMutation({
    mutationFn: () =>
      postAdmin(`admin/services/${challId}/teams/${teamId}/restart`, {
        json: { confirm: true },
      }),
  });

  const { isFetching: statusFetching, data: status } = useQuery({
    queryKey: ["admin", "services", "status", challId, teamId],
    queryFn: () =>
      getAdmin<number>(`admin/services/${challId}/teams/${teamId}/status`),
  });

  return (
    <div
      key={teamId}
      className="flex flex-row justify-between p-4 rounded-md bg-base-100 text-base-content items-center"
    >
      <div className="flex flex-col gap-2">
        <div className="flex flex-row gap-2">
          <strong>{teamName}</strong>
          <ul className="list-inside">
            {addresses.map((addr) => (
              <li key={addr}>{addr}</li>
            ))}
          </ul>
        </div>

        <p>
          Status:{" "}
          <strong className="font-bold">
            {statusFetching
              ? "Loading"
              : status?.data == 0
              ? "Faulty"
              : "Valid"}
          </strong>
        </p>
      </div>

      <div className="flex flex-row gap-2">
        <ConfirmModal
          action="reset"
          btn={<button className="btn btn-error btn-sm">Reset</button>}
          onAction={() => resetMutation.mutate()}
        >
          Are you sure you want to reset?
        </ConfirmModal>
        <ConfirmModal
          action="restart"
          btn={<button className="btn btn-primary btn-sm">Restart</button>}
          onAction={() => restartMutation.mutate()}
        >
          Are you sure you want to restart?
        </ConfirmModal>
      </div>
    </div>
  );
}

function ServiceRow({ chall, services }: ServiceRowProps) {
  const { isLoading: teamsLoading, data: teamsData } = useQuery({
    queryKey: ["teams"],
    queryFn: () => getAdmin<Team[]>("admin/teams/"),
  });

  console.log(chall);

  if (teamsLoading) {
    return (
      <div className="flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!!!teamsData) {
    return (
      <div className="flex items-center justify-center">
        An error occured while trying to load team data.
      </div>
    );
  }

  return (
    <details className="p-4 rounded-md bg-neutral">
      <summary className="font-bold">
        {chall?.title ?? "ChallengeNotFound"}
      </summary>
      <div className="flex flex-col gap-2 pl-4">
        {Object.entries(services).map(([teamId, address]) => {
          const team = teamsData.data.find(
            (team) => team.id === Number(teamId)
          );
          return (
            <TeamServiceRow
              addresses={address}
              challId={chall?.id ?? 0}
              teamId={team?.id ?? 0}
              teamName={team?.name ?? "TeamNotFound"}
              key={`${chall?.id}-${team?.id}`}
            />
          );
        })}
      </div>
    </details>
  );
}

export default function ServicePage() {
  const { isLoading: servicesLoading, data: servicesData } = useQuery({
    queryKey: ["services"],
    queryFn: () => getAdmin<ServiceList>("admin/services/"),
    refetchInterval: false,
  });
  const { isLoading: challsLoading, data: challsData } = useQuery({
    queryKey: ["challenges"],
    queryFn: () => getAdmin<Challenge[]>("admin/challenges/"),
    refetchInterval: false,
  });

  const provisionServices = useMutation({
    mutationFn: () =>
      postAdmin("admin/services/provision", {
        json: { challenges: "*", teams: "*" },
      }),
  });

  return (
    <div className="px-4">
      <div className="flex flex-row justify-between">
        <h2 className="py-2 text-2xl font-bold">Service</h2>
      </div>

      <div className="bg bg-neutral rounded-md p-4 my-2 flex flex-row justify-between items-center gap-4">
        <div className="flex flex-col gap-2">
          <strong className="font-strong text-lg">Provision Services</strong>
          <p className="text-sm">
            Provision each team&apos;s challenge services to the respective
            server.
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => provisionServices.mutate()}
        >
          Provision
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {servicesLoading || challsLoading ? (
          <div className="flex items-center justify-center">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : !!!servicesData || Object.keys(servicesData.data).length === 0 ? (
          <div className="flex items-center justify-center">
            No services to show
          </div>
        ) : !!!challsData ? (
          <div className="flex items-center justify-center">
            Failed to load challenges data
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {Object.entries(servicesData.data).map(([challId, services]) => (
              <ServiceRow
                key={challId}
                chall={challsData.data.find(
                  (chall) => chall.id == Number(challId)
                )}
                services={services}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
