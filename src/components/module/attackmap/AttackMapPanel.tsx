import type { Team } from "@/types/team";
import { getCoordinates } from "./utils";
import { useId } from "react";

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
			/>
			<foreignObject
				x={posX + pointSize / 2 - 70}
				y={posY + pointSize + labelGapSize - 32}
				width={140}
				height={100}
			>
				<div
					className="map-entity px-1 text-center"
					style={{
						wordBreak: "break-word",
						overflowWrap: "anywhere",
						lineHeight: 1.1,
					}}
				>
					{pointName}
				</div>
			</foreignObject>
		</g>
	);
}

export function AttackMapPanel({ teamData }: AttackMapPanelProps) {
	const teamLen = teamData?.length ?? 1;
	const entityId = useId();

	return (
		<g id={entityId}>
			{teamData?.map((data, idx) => (
				<AttackMapPoint
					pointId={idx}
					pointName={data.name}
					teamLen={teamLen}
					key={"ent-point-" + data.id}
				/>
			))}
		</g>
	);
}
