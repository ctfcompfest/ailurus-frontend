import { Submission } from "@/types/submission";
import {
  getAdmin,
  useAdminChallenges,
  useAdminTeams,
} from "@/components/fetcher/admin";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { Pagination } from "@/components/module/common/Pagination/Pagination";
import { useRouter } from "next/router";
import { useRef, useEffect } from "react";

interface PaginationType {
  current_page: number,
  prev_page : number,
  next_page: number
}

function FilterPanel() {
  const router = useRouter();
  const { isLoading: challengesLoad, data: challenges } = useAdminChallenges();
  const { isLoading: teamsLoad, data: teams } = useAdminTeams();
  const searchParams = useSearchParams();
  const filterRef: { [index: string]: any } = {
    verdict: useRef<HTMLSelectElement>(null),
    team_id: useRef<HTMLSelectElement>(null),
    challenge_id: useRef<HTMLSelectElement>(null),
  };

  useEffect(() => {
    // Set initial values based on searchParams
    for (const key in filterRef) {
      if (filterRef[key].current) {
        filterRef[key].current.value = searchParams.get(key) || '*';
      }
    }
  }, [searchParams]);

  const resetFiltering = () => {
    router.push("/admin/submission");
    for (const key in filterRef) {
      if (filterRef[key].current === undefined) continue;
      filterRef[key].current.value = "*";
    }
  };

  const applyFiltering = () => {
    const query: { [index: string]: any } = {};
    for (const key in filterRef) {
      if (filterRef[key].current === undefined) continue;
      if (filterRef[key].current.value === "*") continue;
      query[key] = filterRef[key].current.value;
    }

    router.push({
      pathname: "/admin/submission",
      query: query,
    });
  };

  return (
    <div className="border-solid border-2 border-slate-700 rounded-md mb-5 p-5">
      <div className="grid grid-cols-3 gap-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text">Verdict</span>
          </label>
          <select
            ref={filterRef["verdict"]}
            defaultValue="*"
            className="select select-bordered"
          >
            <option>*</option>
            <option value="false">Invalid</option>
            <option value="true">Valid</option>
          </select>
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text">Challenge</span>
          </label>
          <select
            ref={filterRef["challenge_id"]}
            defaultValue="*"
            className="select select-bordered"
          >
            <option>*</option>
            {challengesLoad ? (
              <></>
            ) : (
              <>
                {challenges?.data.map((challenge) => (
                  <option
                    value={challenge.id}
                    key={"chall-opt-" + challenge.id}
                  >
                    {challenge.title}
                  </option>
                ))}
              </>
            )}
          </select>
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text">Team</span>
          </label>
          <select
            ref={filterRef["team_id"]}
            defaultValue="*"
            className="select select-bordered"
          >
            <option>*</option>
            {teamsLoad ? (
              <></>
            ) : (
              <>
                {teams?.data.map((team) => (
                  <option value={team.id} key={"team-opt-" + team.id}>
                    {team.name}
                  </option>
                ))}
              </>
            )}
          </select>
        </div>
      </div>
      <div className="flex flex-row justify-end gap-2 my-4">
        <button onClick={resetFiltering} className="btn btn-secondary">
          Reset
        </button>
        <button onClick={applyFiltering} className="btn btn-primary">
          Apply filter
        </button>
      </div>
    </div>
  );
}

function SubmissionRow({ data }: {data: Submission}) {
  return (
    <tr>
      <th>{data.id}</th>
      <td>{data.time_created}</td>
      <td>{data.challenge_name}</td>
      <td>{data.team_name}</td>
      <td>{data.value}</td>
      <td>{data.verdict ? "Valid" : "Invalid"}</td>
      <td>{data.point.toFixed(2)}</td>
    </tr>
  );
}

export default function SubmissionPage() {
  const searchParams = useSearchParams();
  const { isLoading, data } = useQuery({
    queryKey: ["submissions", searchParams.toString()],
    queryFn: () =>
      getAdmin<Submission[], PaginationType>("admin/submissions/", {
        searchParams: searchParams,
      }),
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="px-4 justify-center w-full">
      <div className="flex flex-row justify-between">
        <h2 className="py-2 text-2xl font-bold">Submission</h2>
      </div>
      <FilterPanel />
      <div>
        <div>
          <table className="table table-zebra">
            {/* head */}
            <thead>
              <tr>
                <th>#</th>
                <th>Time</th>
                <th>Challenge</th>
                <th>Team</th>
                <th>Value</th>
                <th>Verdict</th>
                <th>Point(s)</th>
              </tr>
            </thead>
            <tbody>
              {data?.data.map((submission) => (
                <SubmissionRow
                  data={submission}
                  key={"submission-" + submission.id}
                />
              ))}
            </tbody>
          </table>
          <Pagination
            activePage={data?.current_page ?? 1}
            prevPage={data?.prev_page}
            nextPage={data?.next_page}
          />
        </div>
      </div>
    </div>
  );
}
