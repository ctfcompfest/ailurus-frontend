import { getAdmin } from "@/components/fetcher/admin";
import { Service } from "@/types/service";
import { useQuery } from "@tanstack/react-query";
import { ReactElement, useRef } from "react";

export default function ServiceDetailModal({
  challId,
  teamId,
  btn,
}: {
  challId: number,
  teamId: number,
  btn: ReactElement,
}) {
  const { isLoading, data } = useQuery({
    queryKey: ["services", challId, teamId],
    queryFn: () => getAdmin<Service[]>(`admin/services/?team_id=${teamId}&challenge_id=${challId}`),
  });

  const ref = useRef<HTMLDialogElement>(null);
  return (
    <>
      <a onClick={() => ref.current?.showModal()}>{btn}</a>
      <dialog className="modal" ref={ref}>
        <div className="modal-box">
          {isLoading ? (
            <div className="flex items-center justify-center">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : (!!!data || data.data.length == 0) ? (
            <div className="flex items-center justify-center">
              No services to show
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {data?.data.map((service, index) => (
                <div className="mb-3" key={`svcdetail-${index}`}>
                  <strong>{`Service #${service.order}`}</strong>
                  <pre>{JSON.stringify(service, null, 2)}</pre>
                </div>
              ))}
            </div>
          )}
          <div className="flex flex-row justify-end pt-4">
            <button className="btn btn-primary" onClick={() => ref.current?.close()}>
              Close
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </>
  );
}
