import { motion, useAnimation } from "framer-motion";
import { AttackMarker } from "./interface";
import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { attackMarkerAtom } from "@/components/states";
import { getCoordinates, generateControlPoints } from "./utils";

const soundEffectFile = "/sounds/laser-gun.mp3"

interface AttackMarkerPanelProps {
  markerData: AttackMarker[];
  teamLen: number;
}

interface AttackMarkProps {
  attackerId: number;
  defenderId: number;
  color: string;
  teamLen: number;
}

function AttackMarkerLine({
  attackerId,
  defenderId,
  color,
  teamLen,
}: AttackMarkProps) {
  const { posX: attackX, posY: attackY } = getCoordinates(attackerId, teamLen);
  const { posX: defendX, posY: defendY } = getCoordinates(defenderId, teamLen);
  const showMarker = useAnimation();
  const hideMarker = useAnimation();
  var [attackMarker, setAttackMarker] = useAtom(attackMarkerAtom);
  var [isDelete, setIsDelete] = useState(false);

  const P0 = { x: attackX + 50, y: attackY + 17 };
  const P3 = { x: defendX + 50, y: defendY + 17 };
  const { P1, P2 } = generateControlPoints(P0, P3);

  useEffect(() => {
    showMarker.start({
      pathLength: [0, 1],
      transition: { duration: 0.5 },
    });
    const soundEffect = new Audio(soundEffectFile);
    soundEffect.play().catch(e => {
      console.log("[Error] Error occured when playing audio.", e)
    });

  }, [showMarker]);
  useEffect(() => {
    hideMarker.start({
      pathLength: [1, 0],
      transition: { duration: 0.5, delay: 1 },
    });
  }, [isDelete]);
  return (
    <g>
      {!isDelete && (
        <motion.path
          style={{ stroke: color, strokeWidth: "1mm", fill: "none" }}
          d={`M ${P0.x},${P0.y} C ${P1.x},${P1.y} ${P2.x},${P2.y} ${P3.x},${P3.y}`}
          initial={{ pathLength: 0 }}
          animate={showMarker}
          onAnimationComplete={() => setIsDelete(true)}
        />
      )}
      {isDelete && (
        <motion.path
          style={{ stroke: color, strokeWidth: "1mm", fill: "none" }}
          d={`M ${P3.x},${P3.y} C ${P2.x},${P2.y} ${P1.x},${P1.y} ${P0.x},${P0.y}`}
          initial={{ pathLength: 1 }}
          animate={hideMarker}
          onAnimationComplete={() => setAttackMarker(attackMarker.slice(1))}
        />
      )}
    </g>
  );
}

export function AttackMarkerPanel({
  markerData,
  teamLen,
}: AttackMarkerPanelProps) {
  return (
    <g>
      {markerData.map((val, idx) => (
        <AttackMarkerLine
          attackerId={val.attackerId}
          defenderId={val.defenderId}
          color={val.color}
          teamLen={teamLen}
          key={"marker-" + idx}
        />
      ))}
    </g>
  );
}
