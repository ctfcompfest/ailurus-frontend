import { ArrowDown, ArrowUp } from "@phosphor-icons/react";

interface ServiceStatusProps {
  status?: number;
  size?: number;
}

export default function ServiceStatus({status, size}: ServiceStatusProps) {
  if (size === undefined) {
    size = 20;
  }

  if (status === 0) {
    return (
      <span className="text-error flex items-center gap-1">
        <ArrowDown size={size} className="inline" />
        {"Faulty"}
      </span>
    );
  }
  
  if (status === 1) {
    return (
      <span className="text-success flex items-center gap-1">
        <ArrowUp size={size} className="inline" />
        {"Valid"}
      </span>
    );
  }

  return (
    <span className="items-center">Loading...</span>
  );
}
