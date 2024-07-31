import { getUser, postUser, useUserResources } from "@/components/fetcher/user";
import { Challenge } from "@/types/challenge";
import { ServerMode } from "@/types/common";
import { ServerState, ServiceMeta } from "@/types/service";
import { ArrowDown, ArrowUp, Lock } from "@phosphor-icons/react";
import { useMutation, useQueries, useQuery } from "@tanstack/react-query";
import React, { useRef } from "react";
import ConfirmModal from "../../common/Modal/ConfirmModal";
import { useRouter } from "next/router";
import { TeamChallServiceProps } from "./interface";
import PatchBasedPanel from "./manager-panel/PatchBasedPanel";
import FullServerBasedPanel from "./manager-panel/FullServerBasedPanel";

export default function ServiceManagerPage() {
  const router = useRouter();
  const challId = router.query.id;

  const {
    isLoading: challLoad,
    error: challError,
    data: challData,
  } = useQuery({
    queryKey: ["challenges", challId],
    queryFn: () => getUser<Challenge>("challenges/" + challId),
  });

  const {
    isLoading: unlockedLoad,
    error: unlockedError,
    data: unlockedData,
  } = useQuery({
    queryKey: ["unlocked"],
    queryFn: () => getUser<number[]>("my/allow-manage-services"),
  });

  if (challLoad || unlockedLoad) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (challError || unlockedError) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        An error has occured.
      </div>
    );
  }

  const chall = challData?.data;
  const unlockedIds = unlockedData?.data ?? [];

  return (
    <div className="flex flex-col gap-4 px-4">
      { process.env.NEXT_PUBLIC_SERVICE_MANAGE_PANEL === "fullserver" ?
          <FullServerBasedPanel
            chall={chall}
            isUnlocked={unlockedIds.includes(chall?.id ?? -1)}
            key={"chall-" + chall?.id}
          />:<PatchBasedPanel
            chall={chall}
            isUnlocked={unlockedIds.includes(chall?.id ?? -1)}
            key={"chall-" + chall?.id}/>
      }
      
    </div>
  );
}
