import { useMutation, useQueries } from "@tanstack/react-query";
import { TeamChallServiceProps } from "../interface";
import { ServerState, ServiceMeta } from "@/types/service";
import { getUser, postUser } from "@/components/fetcher/user";
import { useRef, useCallback } from "react";
import { ArrowDown, ArrowUp, Lock } from "@phosphor-icons/react";
import ConfirmModal from "@/components/module/common/Modal/ConfirmModal";

export default function FullServerBasedPanel({ chall, isUnlocked }: TeamChallServiceProps) {
    const [statusQuery, credsQuery] = useQueries({
      queries: [
        {
          queryKey: ["team", "chall", chall?.id, "status"],
          queryFn: () => getUser<ServerState>(`my/challenges/${chall?.id}/services-status/`),
          enabled: isUnlocked,
        },
        {
          queryKey: ["team", "chall", chall?.id, "credentials"],
          queryFn: () => getUser<Map<string, any>>(`my/challenges/${chall?.id}/service-manager/?action=get_credentials`),
          enabled: isUnlocked,
        },
      ],
    });
    const ref = useRef<HTMLInputElement>(null);

    const resetService = useMutation({
      mutationFn: () =>
        postUser(`my/challenges/${chall?.id}/service-manager/?action=reset`, {
          json: { confirm: true },
        }),
    });

    const capitalizeWords = (str: string) => {
      console.log(str);
      return str.replace(/\b\w/g, c => c.toUpperCase())
    };
    
    const faultyDisplay = (statusDetail: string | undefined) => (
      <span className="text-error items-center gap-2">
        <ArrowDown size={20} className="inline" />&nbsp;
        {typeof statusDetail === "string" ? capitalizeWords(statusDetail):"Faulty"}
      </span>
    );
    const validDisplay = (statusDetail: string | undefined) => (
      <span className="text-success items-center gap-2">
        <ArrowUp size={20} className="inline" />&nbsp;
        {typeof statusDetail === "string" ? capitalizeWords(statusDetail):"Valid"}
      </span>
    );
  
    const handleDownload = (textContent: string) => {
      const filename = 'privatekey.pem';
      const content = textContent;
  
      if ('download' in HTMLAnchorElement.prototype) {
        // For modern browsers
        const element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
        element.setAttribute('download', filename);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
      }
    };

    return (
      <div className="p-4 rounded-md bg-neutral">
        <div className="px-4 pt-4">
          <div></div>
          <h3 className="font-bold text-xl gap-2">
            [
            <span>
              {statusQuery.isFetching
                ? "Loading..."
                : statusQuery.error
                ? "An error occured"
                : (statusQuery.data?.data?.status == 0 || statusQuery.data?.data?.status == undefined)
                ? faultyDisplay(statusQuery.data?.data?.detail)
                : validDisplay(statusQuery.data?.data?.detail)}
            </span>{" "}
            ]{"  "}
            {chall?.title ?? "ChallengeNotFound"}{" "}
            {!isUnlocked && <Lock size={18} className="inline" />}
          </h3>
        </div>
  
        <div className="flex flex-col gap-2 p-4">
          <div className="divider m-0" />
          {isUnlocked ? (
            <>
              {credsQuery.data ?
                Object.entries(credsQuery.data?.data).map(([key, value]) => (
                  <div className="my-2" key={key}>
                    <div className="mb-2">
                      <strong className="gap-2">{key}:</strong>
                      {/key/i.test(key) ? <button className="btn btn-sm btn-primary mx-2" onClick={() => handleDownload(value)}>Download Key</button>:<></>}
                    </div>
                    <pre className="p-4 rounded-md bg-base-300">
                      {typeof value === 'string' ? value:JSON.stringify(value, null, 2)}
                    </pre>
                  </div>
                )):<></>
              }
              
      
              <div className="divider m-0" />
    
              <div className="flex flex-row gap-2">
                <ConfirmModal
                  action="Reset"
                  btn={<button className="btn btn-error">Reset</button>}
                  onAction={() => resetService.mutate()}
                >
                  Are you sure you want to reset?
                </ConfirmModal>
              </div>
            </>              
          ) : (
            <div className="p-4 bg-base-300 rounded-md">
              Cannot patch. You have not solved this challenge!
            </div>
          )}
        </div>
      </div>
    );
  }