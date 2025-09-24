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


const SFX_FILE_PATH = "/sounds/laser-gun.mp3"

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
  let buffer: any[] = [];
  let timeout: NodeJS.Timeout | null = null;

  const handler = (sockData: AttackLog) => {
    // 1. Update attack logs immediately if you want
    setAttackLog((prevLog) => [sockData, ...prevLog]);

    // 2. Create marker for this event
    const markerData = {
      attackerId: teamIdTransform(sockData.attacker.id, teamData),
      defenderId: teamIdTransform(sockData.defender.id, teamData),
      color: randomColor(),
    };
    buffer.push(markerData);

    // 3. Reset debounce timer
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      // after 1s without any new events, flush all buffered markers
      setAttackMarker((prev) => [...prev, ...buffer]);
      buffer = [];
      timeout = null;
    }, 1000);
  };

  socketio.on("attack-event", handler);

  return () => {
    socketio.off("attack-event", handler);
    if (timeout) clearTimeout(timeout);
  };
}, [socketio, teamData, setAttackLog, setAttackMarker]);

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
        <AttackMarkerPanel
          markerData={attackMarker}
          teamLen={teamLen}
          onMarkerDone={() => setAttackMarker((prev) => prev.slice(1))}
          onBatchDone={(count) => setAttackMarker((prev) => prev.slice(count))}
          shotSfxUrl={SFX_FILE_PATH}
        />
      </svg>
    </div>
  );
}
