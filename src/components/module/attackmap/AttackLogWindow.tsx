import { ArrowRight } from "@phosphor-icons/react";
import React, { useState, useRef } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { AttackLog } from "./interface";

dayjs.extend(utc);

export interface AttackLogWindowProps {
  attackLogs: AttackLog[];
}

export interface AttackLogRowProps {
  attacker: string;
  defender: string;
  index: number;
  solved_at?: Date;
}


const utcOffset = parseInt(process.env.NEXT_PUBLIC_UTC_OFFSET ?? '0')
function AttackLogRow({ attacker, defender, index, solved_at }: AttackLogRowProps) {
  return (
    <div>
      {index > 0 && <div className="divider my-0 w-full"></div>}
      <div className="grid grid-cols-4 text-center p-2">
        {solved_at && <pre>
          {dayjs(solved_at).format("HH:mm:ss")}
        </pre>}
        <div className="px-1 text-center break-words whitespace-normal">
          {attacker}
        </div>
        <div className="justify-center flex">
          <ArrowRight size={24} />
        </div>
        <div className="px-1 text-center break-words whitespace-normal">
          {defender}
        </div>
      </div>
    </div>
  );
}

const AttackLogWindow = ({ attackLogs }: AttackLogWindowProps) => {
  const ref = useRef<HTMLDialogElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);

  const handleMouseDown = (e: React.MouseEvent<HTMLElement>) => {
    setIsDragging(true);
    setOffsetX(e.clientX - e.currentTarget.getBoundingClientRect().left);
    setOffsetY(e.clientY - e.currentTarget.getBoundingClientRect().top);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!isDragging) return;
    const x = e.clientX - offsetX;
    const y = e.clientY - offsetY;
    e.currentTarget.style.left = x + "px";
    e.currentTarget.style.top = y + "px";
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div
      className={"fixed rounded-md shadow-lg block w-1/4"}
      style={{ cursor: isDragging ? "grabbing" : "grab", left: "75%" }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <div className="flex justify-between py-1 px-2 bg-neutral-focus">
        <h2 className="font-semibold">Attack Logs</h2>
      </div>
      <div
        className="py-2 bg-neutral-focus max-h-96 overflow-auto"
        style={{ opacity: 0.55 }}
      >
        {attackLogs.map((row, index) => (
          <AttackLogRow
            solved_at={row.solved_at}
            attacker={row.attacker.name}
            defender={row.defender.name}
            index={index}
            key={`attack-log-row-${index}`}
          />
        ))}
      </div>
    </div>
  );
};

export default AttackLogWindow;
