import { BaseResponse, ServerMode } from "@/types/common";
import ky, { HTTPError } from "ky-universal";
import { api } from "./base";
import { toast } from "react-hot-toast";
import { Challenge } from "@/types/challenge";
import { useQuery } from "@tanstack/react-query";
import { Team } from "@/types/team";

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
        "X-ADMIN-SECRET": JSON.parse(localStorage.getItem("adminToken") ?? ""),
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

export const getAdmin = <T, TExtra = {}>(...args: RequestFnArguments) =>
  doApi<T, TExtra>(args[0], {
    ...args[1],
    method: "GET",
  });

export const postAdmin = <T, TExtra = {}>(...args: RequestFnArguments) =>
  doApi<T, TExtra>(
    args[0],
    {
      ...args[1],
      method: "POST",
    },
    true
  );

export const putAdmin = <T, TExtra = {}>(...args: RequestFnArguments) =>
  doApi<T, TExtra>(
    args[0],
    {
      ...args[1],
      method: "PUT",
    },
    true
  );

export const deleteAdmin = <T, TExtra = {}>(...args: RequestFnArguments) =>
  doApi<T, TExtra>(
    args[0],
    {
      ...args[1],
      method: "DELETE",
    },
    true
  );

export const patchAdmin = <T, TExtra = {}>(...args: RequestFnArguments) =>
  doApi<T, TExtra>(
    args[0],
    {
      ...args[1],
      method: "PATCH",
    },
    true
  );

export const useAdminTeams = () =>
  useQuery({
    queryKey: ["admin", "teams"],
    queryFn: () => getAdmin<Team[]>("admin/teams/"),
  });

export const useAdminChallenges = () =>
  useQuery({
    queryKey: ["admin", "challenges"],
    queryFn: () => getAdmin<Challenge[]>("admin/challenges/"),
  });

