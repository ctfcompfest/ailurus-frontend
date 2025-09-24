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
      {Object.entries(contestConfig).map(([key, value]) => (
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
      ))}
    </div>
  );
}
