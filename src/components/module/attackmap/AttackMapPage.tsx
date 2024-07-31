import { socketio } from "@/components/fetcher/socket";
import { useEffect, useState } from "react";
import AttackLogWindow from "./AttackLogWindow";
import { AttackLog } from "./interface";
import { AttackMapPanel } from "./AttackMapPanel";
import { AttackMarkerPanel } from "./AttackMarkerPanel";
import { useUserTeams } from "@/components/fetcher/user";
import { Team } from "@/types/team";
import { ServerMode } from "@/types/common";
import { useAtom } from "jotai";
import { attackMarkerAtom } from "@/components/states";
import { randomColor } from "./utils";

function teamIdTransform(srcId: number, data?: Team[]) {
  if (data == undefined) return -1;
  for (var i = 0; i < data.length; i++) {
    if (data[i].id == srcId) return i;
  }
  return -1;
}

export default function AttackMapPage() {
  const { isLoading, data } = useUserTeams();
  const teamData = data?.data;
  const teamLen = teamData?.length ?? 1;

  var [attackLog, setAttackLog] = useState<AttackLog[]>([]);
  var [attackMarker, setAttackMarker] = useAtom(attackMarkerAtom);

  useEffect(() => {
    socketio.on("attack-event", (sockData: AttackLog) => {
      setAttackLog((prevLog) => [sockData, ...prevLog]);
      const markerData = {
        attackerId: teamIdTransform(sockData.attacker.id, teamData),
        defenderId: teamIdTransform(sockData.defender.id, teamData),
        color: randomColor(),
      };
      attackMarker.push(markerData);
      setAttackMarker(attackMarker);
    });
    return () => {
      socketio.off("attack-event");
    };
  }, [socketio, teamData, attackMarker]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <AttackLogWindow attackLogs={attackLog} />
      <svg
        xmlns="http://www.w3.org/2000/svg"
        version="1.1"
        id="attack-map"
        width="100%"
        height="100%"
        viewBox="0 0 1500 750"
      >
        <AttackMapPanel teamData={data?.data} />
        <AttackMarkerPanel markerData={attackMarker} teamLen={teamLen} />
      </svg>
    </div>
  );
}
