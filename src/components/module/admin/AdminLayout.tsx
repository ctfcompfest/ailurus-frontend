import {
  Article,
  Cloud,
  Crown,
  Flag,
  Gavel,
  HardDrives,
  SignOut,
  Users,
  Wrench,
} from "@phosphor-icons/react";
import React, { ReactElement } from "react";
import type { Icon } from "@phosphor-icons/react";
import { ComponentWithChildren } from "@/types/common";
import Link from "next/link";
import { useAtom } from "jotai";
import { adminTokenAtom } from "@/components/states";
import { useRouter } from "next/router";
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

export default function AdminLayout({
  children,
  className,
}: ComponentWithChildren) {
  useTitle(`Admin Panel | Ailurus`);

  const [_, setAdminToken] = useAtom(adminTokenAtom);
  const router = useRouter();
  return (
    <div>
      <h1 className="ml-4 py-4 text-2xl font-bold">Admin Panel</h1>
      <div className="flex flex-row gap-8">
        <div className="flex flex-col gap-2">
          <ConfigMenu
            icon={<Crown size={24} />}
            title="Leaderboard"
            href="/admin/leaderboard"
          />
          <ConfigMenu
            icon={<Wrench size={24} />}
            title="Configuration"
            href="/admin/config"
          />
          <ConfigMenu
            icon={<Users size={24} />}
            title="Team"
            href="/admin/team"
          />
          <ConfigMenu
            icon={<HardDrives size={24} />}
            title="Machine"
            href="/admin/machine"
          />
          <ConfigMenu
            icon={<Flag size={24} />}
            title="Challenge"
            href="/admin/challenge"
          />
          <ConfigMenu
            icon={<Cloud size={24} />}
            title="Service"
            href="/admin/service"
          />
          <ConfigMenu
            icon={<Article size={24} />}
            title="Submission"
            href="/admin/submission"
          />
          <ConfigMenu
            icon={<Gavel size={24} />}
            title="Checker"
            href="/admin/checker"
          />
          <a
            className="flex flex-row gap-2 items-center py-3 px-4 hover:bg-neutral rounded-r-full hover:cursor-pointer"
            onClick={() => {
              setAdminToken("");
              router.push("/");
            }}
          >
            <SignOut size={24} />
            Sign out
          </a>
        </div>
        <div className={"w-full " + className}>{children}</div>
      </div>
    </div>
  );
}
