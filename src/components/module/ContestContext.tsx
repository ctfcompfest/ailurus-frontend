import { getUser } from "@/components/fetcher/user";
import { ComponentWithChildren } from "@/types/common";
import { ContestInfo } from "@/types/contest";
import { X } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { createContext, useContext } from "react";

interface ContestContextData {
  contest: ContestInfo;
}

export const ContestContext = createContext<ContestContextData>({
  contest: {
    event_name: "",
    event_status: "not started",
    current_tick: 0,
    current_round: 0,
    number_round: 0,
    number_tick: 0,
    start_time: "",
    tick_duration: 0,
    logo_url: "",
  },
});

export const useContestContext = () => useContext(ContestContext);

export function ContestContextProvider({ children }: ComponentWithChildren) {
  const { isLoading, data, error } = useQuery({
    queryKey: ["contest"],
    queryFn: () => getUser<ContestInfo>("contest/info"),
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
        <X size={32} />
        <p>Failed to fetch contest information</p>
      </div>
    );
  }

  return (
    <ContestContext.Provider value={{ contest: data?.data! }}>
      {children}
    </ContestContext.Provider>
  );
}
