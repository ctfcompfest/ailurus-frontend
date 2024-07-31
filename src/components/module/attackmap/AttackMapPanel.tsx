import { ServerMode } from "@/types/common";
import { Team } from "@/types/team";
import { getCoordinates } from "./utils";

interface AttackMapPanelProps {
  teamData?: Team[];
}

interface AttackMapPointProps {
  pointId: number;
  pointName: string;
  teamLen: number;
}

function AttackMapPoint({ pointId, pointName, teamLen }: AttackMapPointProps) {
  const pointSize = 100;
  const labelGapSize = 30;
  const { posX, posY } = getCoordinates(pointId, teamLen);

  return (
    <g>
      <image
        href={"/entity-team.png"}
        width={pointSize}
        height={pointSize}
        x={posX}
        y={posY}
      ></image>
      <text
        x={posX + pointSize / 2}
        y={posY + pointSize + labelGapSize}
        textAnchor="middle"
        className="map-entity"
      >
        {pointName}
      </text>
    </g>
  );
}

export function AttackMapPanel({ teamData }: AttackMapPanelProps) {
  const teamLen = teamData?.length ?? 1;

  return (
    <g id="entity">
      {teamData?.map((data, idx) => (
        <AttackMapPoint
          pointId={idx}
          pointName={data.name}
          teamLen={teamLen}
          key={"ent-point-" + idx}
        />
      ))}
    </g>
  );
}
