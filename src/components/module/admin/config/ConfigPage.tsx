import React, { useContext, useState } from "react";
import { AdminContext } from "../AdminContext";
import { ConfigType } from "@/types/common";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { patchAdmin, postAdmin } from "@/components/fetcher/admin";
import { Plus } from "@phosphor-icons/react";
import ConfirmModal from "../../common/Modal/ConfirmModal";

interface ConfigProps {
  configs: ConfigType;
}

export default function ConfigPage() {
  const queryClient = useQueryClient();
  const { contestConfig } = useContext(AdminContext);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editedValue, setEditedValue] = useState("");

  const mutateConfig = useMutation({
    mutationFn: ({key, value}: ConfigType) =>
      patchAdmin<ConfigType>(`admin/configs/${key}`, {
        json: {
          value: value,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["config"]});
    },
  });

  const handleEdit = (key: string, value: string) => {
    setEditingKey(key);
    setEditedValue(value);
  };

  const handleSave = (key: string) => {
    mutateConfig.mutate({key: key, value: editedValue});
    setEditingKey(null);
  };

  const handleCancel = () => {
    setEditingKey(null);
    setEditedValue("");
  };
  
  const resetGameMutation = useMutation({
    mutationFn: () =>
      postAdmin(`admin/contests/reset-game/`, {
        json: { confirm: true },
      }),
  });

  const ConfigInlineEdit = ({config_key, value}: {config_key: string, value: string}) => {
    return (
      <div className="grid grid-cols-7 gap-4 mb-3" key={config_key}>
        <React.Fragment>
          <div className="flex flex-row col-span-2 items-center">
            <strong>{config_key}:</strong>
          </div>
          <div className="flex flex-row items-center col-span-4 w-full">
            {editingKey === config_key ? (
              <input
                className="input input-bordered w-full"
                value={editedValue}
                onChange={(e) => setEditedValue(e.target.value)}
              />
            ) : (
              <pre>{value}</pre>
            )}
          </div>
          <div className="flex flex-row items-center gap-2">
            {editingKey === config_key ? (
              <>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => handleSave(config_key)}
                >
                  Save
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => handleEdit(config_key, value)}
              >
                Edit
              </button>
            )}
          </div>
        </React.Fragment>
      </div>
    )
  };

  const CONTEST_INFO_KEY = ["EVENT_NAME", "LOGO_URL", "SERVICE_MODE", "UNLOCK_MODE"];
  const CONTEST_SESSION_KEY = ["NUMBER_ROUND", "NUMBER_TICK", "TICK_DURATION"];
  const CONTEST_TIME_KEY = ["START_TIME", "ATTACK_TIME", "FREEZE_TIME", "IS_CONTEST_PAUSED"];
  const CONTEST_FLAG_KEY = ["FLAG_FORMAT", "FLAG_RNDLEN"];
  const CONTEST_PROGRESS_KEY = ["CURRENT_TICK", "CURRENT_ROUND", "LAST_TICK_CHANGE", "FREEZE_TICK", "FREEZE_ROUND", "LAST_PAUSED"];
  const EXCLUDED_KEY = [...CONTEST_INFO_KEY, ...CONTEST_SESSION_KEY, ...CONTEST_TIME_KEY, ...CONTEST_PROGRESS_KEY, ...CONTEST_FLAG_KEY];
  return (
    <div className="px-4 mb-5">
      <div className="flex flex-row justify-between mb-4">
        <h2 className="pt-2 pb-4 text-2xl font-bold">Configuration</h2>
        <ConfirmModal
          action="Reset"
          btn={<button className="btn btn-error">Reset Game Data</button>}
          onAction={() => resetGameMutation.mutate()}
        >
          Flag, submission, game progress will be <u>deleted</u>. Are you sure?
        </ConfirmModal>
      </div>
      <div className="my-5">
        <div className="bg bg-neutral rounded-md px-4 py-2 my-2 flex flex-row justify-between items-center gap-4">
          <div className="flex flex-col gap-2">
            <strong className="font-strong text-lg">General</strong>
          </div>
        </div>
        {CONTEST_INFO_KEY.filter((key) => key in contestConfig).map(
          (key) => <ConfigInlineEdit key={key} config_key={key} value={contestConfig[key]} />
        )}
      </div>
      <div className="my-5">
        <div className="bg bg-neutral rounded-md px-4 py-2 my-2 flex flex-row justify-between items-center gap-4">
          <div className="flex flex-col gap-2">
            <strong className="font-strong text-lg">Time</strong>
          </div>
        </div>
        {CONTEST_TIME_KEY.filter((key) => key in contestConfig).map(
          (key) => <ConfigInlineEdit key={key} config_key={key} value={contestConfig[key]} />
        )}
      </div>
      <div className="my-5">
        <div className="bg bg-neutral rounded-md px-4 py-2 my-2 flex flex-row justify-between items-center gap-4">
          <div className="flex flex-col gap-2">
            <strong className="font-strong text-lg">Contest Progress</strong>
          </div>
        </div>
        {CONTEST_PROGRESS_KEY.filter((key) => key in contestConfig).map(
          (key) => <ConfigInlineEdit  key={key} config_key={key} value={contestConfig[key]} />
        )}
      </div>
      <div className="my-5">
        <div className="bg bg-neutral rounded-md px-4 py-2 my-2 flex flex-row justify-between items-center gap-4">
          <div className="flex flex-col gap-2">
            <strong className="font-strong text-lg">Game Stage</strong>
          </div>
        </div>
        {CONTEST_SESSION_KEY.filter((key) => key in contestConfig).map(
          (key) => <ConfigInlineEdit key={key} config_key={key} value={contestConfig[key]} />
        )}
      </div>
      <div className="my-5">
        <div className="bg bg-neutral rounded-md px-4 py-2 my-2 flex flex-row justify-between items-center gap-4">
          <div className="flex flex-col gap-2">
            <strong className="font-strong text-lg">Flag</strong>
          </div>
        </div>
        {CONTEST_FLAG_KEY.filter((key) => key in contestConfig).map(
          (key) => <ConfigInlineEdit key={key} config_key={key} value={contestConfig[key]} />
        )}
      </div>
      <div className="my-5">
        <div className="bg bg-neutral rounded-md px-4 py-2 my-2 flex flex-row justify-between items-center gap-4">
          <div className="flex flex-col gap-2">
            <strong className="font-strong text-lg">Other</strong>
          </div>
        </div>
        {Object.entries(contestConfig).filter(([key, value]) => EXCLUDED_KEY.indexOf(key) === -1).map(
          ([key, value]) => <ConfigInlineEdit  key={key} config_key={key} value={value} />
        )}
      </div>
      {/* {Object.entries(contestConfig).map(([key, value]) => (
        <div className="grid grid-cols-7 gap-4 mb-3" key={key}>
          <React.Fragment>
            <div className="flex flex-row col-span-2 items-center">
              <strong>{key}:</strong>
            </div>
            <div className="flex flex-row items-center col-span-4 w-full">
              {editingKey === key ? (
                <input
                  className="input input-bordered w-full"
                  value={editedValue}
                  onChange={(e) => setEditedValue(e.target.value)}
                />
              ) : (
                <pre>{value}</pre>
              )}
            </div>
            <div className="flex flex-row items-center gap-2">
              {editingKey === key ? (
                <>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleSave(key)}
                  >
                    Save
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={handleCancel}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleEdit(key, value)}
                >
                  Edit
                </button>
              )}
            </div>
          </React.Fragment>
        </div>
      ))} */}
    </div>
  );
}
