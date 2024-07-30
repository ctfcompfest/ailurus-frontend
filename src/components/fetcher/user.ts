import { BaseResponse, ServerMode } from "@/types/common";
import { api } from "./base";
import { useQuery } from "@tanstack/react-query";
import { Team } from "@/types/team";
import { Challenge } from "@/types/challenge";
import { ServerState, ServiceList } from "@/types/service";
import toast from "react-hot-toast";
import { HTTPError } from "ky-universal";

type RequestFnArguments = Parameters<typeof api>;

async function doApi<T, TExtra = {}>(
  url: RequestFnArguments[0],
  options: RequestFnArguments[1],
  notify: boolean = false
) {
  let toastId: string = "";
  if (notify) toastId = toast.loading("Running...");
  try {
    const response = await api(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${JSON.parse(
          localStorage.getItem("authToken") ?? "null"
        )}`,
      },
    }).json<BaseResponse<T, TExtra>>();
    if (notify) toast.success(response.message ?? "Success", { id: toastId });
    return response;
  } catch (err) {
    let message = "Unknown error, failed. See developer tools.";
    if (err instanceof HTTPError) {
      const errorJson: BaseResponse<never> = await err.response.json();
      if (errorJson.message) message = errorJson.message;
    }

    if (notify) toast.error(message, { id: toastId });
    throw err;
  }
}

export const getUser = <T, TExtra = {}>(...args: RequestFnArguments) =>
  doApi<T, TExtra>(args[0], {
    ...args[1],
    method: "GET",
  });

export const postUser = <T, TExtra = {}>(...args: RequestFnArguments) =>
  doApi<T, TExtra>(
    args[0],
    {
      ...args[1],
      method: "POST",
    },
    true
  );

export const putUser = <T, TExtra = {}>(...args: RequestFnArguments) =>
  doApi<T, TExtra>(
    args[0],
    {
      ...args[1],
      method: "PUT",
    },
    true
  );

export const useUserTeams = () =>
  useQuery({
    queryKey: ["teams"],
    queryFn: () => getUser<Team[]>("teams/"),
  });

export const useUserChallenges = () =>
  useQuery({
    queryKey: ["user", "challenges"],
    queryFn: () => getUser<Challenge[]>("challenges/"),
  });

export const useUserServices = () =>
  useQuery({
    queryKey: ["user", "services"],
    queryFn: () => getUser<ServiceList>("services/"),
  });

export const useUserServicesStatus = () =>
  useQuery({
    queryKey: ["user", "services", "status"],
    queryFn: () =>
      getUser<Record<string, Record<string, ServerState>>>("services-status"),
  });

export const useUserResources = () => {
  const teams = useUserTeams();
  const challenges = useUserChallenges();
  const services = useUserServices();
  const serviceStatus = useUserServicesStatus();

  return {
    isLoading:
      teams.isLoading ||
      challenges.isLoading ||
      services.isLoading ||
      serviceStatus.isLoading,
    error:
      teams.error || challenges.error || services.error || serviceStatus.error,
    datas: {
      teams: teams.data!,
      challenges: challenges.data!,
      services: services.data!,
      serviceStatus: serviceStatus.data!,
    },
  };
};


export const usePublicResources = () => {
  const teams = useUserTeams();
  const challenges = useUserChallenges();
  const serviceStatus = useUserServicesStatus();

  return {
    isLoading:
      teams.isLoading ||
      challenges.isLoading ||
      serviceStatus.isLoading,
    error:
      teams.error || challenges.error || serviceStatus.error,
    datas: {
      teams: teams.data!,
      challenges: challenges.data!,
      serviceStatus: serviceStatus.data!,
    },
  };
};
