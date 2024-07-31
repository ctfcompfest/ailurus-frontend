import { Crown, Flag, MapTrifold, Question, SignOut } from "@phosphor-icons/react";
import React, { ReactElement, useEffect, useMemo } from "react";
import type { Icon } from "@phosphor-icons/react";
import { ComponentWithChildren } from "@/types/common";
import Link from "next/link";
import { useContestContext } from "../ContestContext";
import { useAtom } from "jotai";
import { authTokenAtom } from "@/components/states";
import { useRouter } from "next/router";
import { Team } from "@/types/team";
import { parseJwt } from "@/components/utils";
import useTitle from "@/components/hook/useTitle";

interface ConfigMenuProps {
  icon: ReactElement<Icon>;
  title: string;
  href: string;
}

function ConfigMenu({ icon, title, href }: ConfigMenuProps) {
  return (
    <Link
      href={href}
      className="flex flex-row gap-2 items-center py-3 px-4 hover:bg-neutral rounded-r-full hover:cursor-pointer"
    >
      {icon}
      {title}
    </Link>
  );
}

export default function DashboardLayout({
  children,
  className,
}: ComponentWithChildren) {
  const { contest } = useContestContext();
  useTitle(`${contest.event_name}`);

  const [authToken, setAuthToken] = useAtom(authTokenAtom);
  const router = useRouter();

  const parsedJwt = useMemo(
    () => parseJwt<{ sub: { team: Team } }>(authToken),
    [authToken]
  );

  useEffect(() => {
    if (!!!authToken && router)
      router.replace(`/?goto=${encodeURIComponent(router.asPath)}`);
  }, [authToken, router]);

  return (
    <div>
      <div className="p-4 flex flex-row justify-between">
        <h1 className="text-2xl font-bold">{contest.event_name}</h1>
        <strong className="font-bold text-2xl">
          {contest.event_status === "finished" ? (
            "Event Finished!"
          ) : contest.event_status === "not started" ? (
            "Not Started"
          ) : contest.event_status === "running" ? (
            <>
              {contest.number_round > 1
                ? `Round: ${contest.current_round}`
                : ""}
              {contest.number_round > 1 && contest.number_tick > 1 && " / "}
              {contest.number_tick > 1
                ? `Tick: ${contest.current_tick}`
                : ""}
            </>
          ) : contest.event_status === "paused" ? (
            <>
              {"Paused ("}
              {contest.number_round > 1
                ? `Round: ${contest.current_round}`
                : ""}
              {contest.number_round > 1 && contest.number_tick > 1 && " / "}
              {contest.number_tick > 1
                ? `Tick: ${contest.current_tick}`
                : ""}
              {")"}
            </>
          ) : (
            "Unknown event state"
          )}
        </strong>
      </div>
      <div className="flex flex-row gap-8">
        <div className="flex flex-col gap-2 basis-[24rem]">
          <ConfigMenu
            icon={<Flag size={24} />}
            title="Challenges"
            href="/dashboard"
          />
          <ConfigMenu
            icon={<Question size={24} />}
            title="Documentation"
            href="/dashboard/docs"
          />
          <ConfigMenu
            icon={<Crown size={24} />}
            title="Leaderboard"
            href="/leaderboard"
          />
          <ConfigMenu
            icon={<MapTrifold size={24} />}
            title="Attack Map"
            href="/attackmap"
          />

          <a
            className="flex flex-row gap-2 items-center py-3 px-4 hover:bg-neutral rounded-r-full hover:cursor-pointer"
            onClick={() => {
              setAuthToken("");
              router.replace("/");
            }}
          >
            <SignOut size={24} />
            Sign out
          </a>

          <div className="divider my-2"></div>

          <div className="flex flex-col gap-2 px-4">
            <strong className="font-bold text-xl">Auth Token</strong>
            <strong>Team ID: {parsedJwt?.sub.team.id}</strong>
            <strong>Team Name: {parsedJwt?.sub.team.name}</strong>
            <code className="break-all p-4 rounded-md bg-base-300 text-sm">
              {authToken}
            </code>
            <p>
              This is your team&apos;s JWT. You can copy and paste on the{" "}
              <code>Authorization</code> header every time your team submits a
              flag to our API.
            </p>
          </div>
        </div>
        <div className={"w-full " + className}>{children}</div>
      </div>
    </div>
  );
}
